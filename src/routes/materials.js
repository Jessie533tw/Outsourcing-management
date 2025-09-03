const express = require('express');
const { Material, MaterialAnalysis } = require('../models/Material');
const Project = require('../models/Project');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { generateId } = require('../utils/helpers');
const multer = require('multer');

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/', authenticateToken, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const { name, category, unit, specification, standardPrice } = req.body;

    if (!name || !category || !unit) {
      return res.status(400).json({ message: '請填寫材料名稱、類別和單位' });
    }

    const materialId = generateId('MAT');
    
    const material = new Material({
      materialId,
      name,
      category,
      unit,
      specification,
      standardPrice
    });

    await material.save();
    res.status(201).json({ message: '材料新增成功', material });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, isActive } = req.query;
    let filter = {};

    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const materials = await Material.find(filter).sort({ category: 1, name: 1 });
    res.json({ materials });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

router.post('/analysis', authenticateToken, async (req, res) => {
  try {
    const { projectId, materials, generatedFrom } = req.body;

    if (!projectId || !materials || !Array.isArray(materials)) {
      return res.status(400).json({ message: '請提供專案ID和材料清單' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: '專案不存在' });
    }

    let totalEstimatedCost = 0;
    const analysisItems = [];

    for (const item of materials) {
      const material = await Material.findById(item.materialId);
      if (material) {
        const estimatedPrice = item.quantity * (material.standardPrice || 0);
        totalEstimatedCost += estimatedPrice;
        
        analysisItems.push({
          material: material._id,
          quantity: item.quantity,
          estimatedPrice,
          notes: item.notes
        });
      }
    }

    const materialAnalysis = new MaterialAnalysis({
      project: project._id,
      materials: analysisItems,
      totalEstimatedCost,
      generatedFrom
    });

    await materialAnalysis.save();
    
    await materialAnalysis.populate('materials.material');
    
    res.status(201).json({ 
      message: '工料分析表生成成功', 
      materialAnalysis
    });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

router.post('/analysis/from-drawing', authenticateToken, upload.single('drawing'), async (req, res) => {
  try {
    const { projectId } = req.body;
    
    if (!projectId) {
      return res.status(400).json({ message: '請提供專案ID' });
    }

    if (!req.file) {
      return res.status(400).json({ message: '請上傳工程圖檔' });
    }

    const materials = await simulateDrawingAnalysis(req.file.path);
    
    const materialAnalysis = await generateMaterialAnalysis(projectId, materials, '工程圖自動識別');
    
    res.status(201).json({ 
      message: '已從工程圖生成工料分析表', 
      materialAnalysis
    });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

async function simulateDrawingAnalysis(filePath) {
  return [
    { materialName: '水泥', quantity: 100, unit: '包' },
    { materialName: '鋼筋', quantity: 50, unit: '公噸' },
    { materialName: '紅磚', quantity: 10000, unit: '塊' },
    { materialName: '石材', quantity: 200, unit: '平方公尺' }
  ];
}

async function generateMaterialAnalysis(projectId, materialData, source) {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error('專案不存在');
  }

  let totalEstimatedCost = 0;
  const analysisItems = [];

  for (const item of materialData) {
    let material = await Material.findOne({ name: item.materialName });
    
    if (!material) {
      const materialId = generateId('MAT');
      material = new Material({
        materialId,
        name: item.materialName,
        category: '自動識別',
        unit: item.unit,
        specification: '從工程圖自動識別'
      });
      await material.save();
    }

    const estimatedPrice = item.quantity * (material.standardPrice || 100);
    totalEstimatedCost += estimatedPrice;
    
    analysisItems.push({
      material: material._id,
      quantity: item.quantity,
      estimatedPrice,
      notes: '從工程圖自動計算'
    });
  }

  const materialAnalysis = new MaterialAnalysis({
    project: project._id,
    materials: analysisItems,
    totalEstimatedCost,
    generatedFrom: source
  });

  await materialAnalysis.save();
  await materialAnalysis.populate('materials.material project');
  
  return materialAnalysis;
}

router.get('/analysis/:projectId', authenticateToken, async (req, res) => {
  try {
    const analyses = await MaterialAnalysis.find({ project: req.params.projectId })
      .populate('materials.material')
      .populate('project', 'name projectId')
      .sort({ createdAt: -1 });

    res.json({ analyses });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

router.put('/analysis/:id/approve', authenticateToken, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const analysis = await MaterialAnalysis.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    ).populate('materials.material project');

    if (!analysis) {
      return res.status(404).json({ message: '工料分析表不存在' });
    }

    res.json({ message: '工料分析表已核准', analysis });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

module.exports = router;