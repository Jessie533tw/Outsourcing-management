const express = require('express');
const { Quotation, PriceComparison, PurchaseOrder } = require('../models/Purchase');
const { MaterialAnalysis } = require('../models/Material');
const Vendor = require('../models/Vendor');
const Project = require('../models/Project');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { generateQuotationId, generatePONumber } = require('../utils/helpers');
const emailService = require('../services/emailService');
const voucherService = require('../services/voucherService');

const router = express.Router();

router.post('/quotations', authenticateToken, async (req, res) => {
  try {
    const { projectId, vendorIds, materialAnalysisId } = req.body;

    if (!projectId || !vendorIds || !Array.isArray(vendorIds)) {
      return res.status(400).json({ message: '請提供專案ID和廠商清單' });
    }

    const project = await Project.findById(projectId);
    const materialAnalysis = await MaterialAnalysis.findById(materialAnalysisId).populate('materials.material');

    if (!project || !materialAnalysis) {
      return res.status(404).json({ message: '專案或工料分析表不存在' });
    }

    const quotations = [];

    for (const vendorId of vendorIds) {
      const vendor = await Vendor.findById(vendorId);
      if (vendor) {
        const quotationId = generateQuotationId();
        
        const quotation = new Quotation({
          quotationId,
          project: project._id,
          vendor: vendor._id,
          materialAnalysis: materialAnalysis._id,
          items: materialAnalysis.materials.map(item => ({
            material: item.material._id,
            quantity: item.quantity,
            unitPrice: 0,
            totalPrice: 0,
            notes: ''
          })),
          totalAmount: 0,
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        await quotation.save();
        quotations.push(quotation);

        await emailService.sendQuotationRequest(vendor.email, quotation, materialAnalysis);
      }
    }

    await MaterialAnalysis.findByIdAndUpdate(materialAnalysisId, { status: 'sent_for_quotation' });

    res.status(201).json({ 
      message: '詢價單已發送', 
      quotations: quotations.length,
      quotationIds: quotations.map(q => q.quotationId)
    });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

router.put('/quotations/:id/submit', async (req, res) => {
  try {
    const { items, totalAmount, vendorComments } = req.body;

    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return res.status(404).json({ message: '詢價單不存在' });
    }

    quotation.items = items;
    quotation.totalAmount = totalAmount;
    quotation.vendorComments = vendorComments;
    quotation.status = 'received';
    quotation.submittedAt = new Date();

    await quotation.save();

    res.json({ message: '報價提交成功', quotation });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

router.post('/price-comparison', authenticateToken, async (req, res) => {
  try {
    const { projectId, quotationIds } = req.body;

    const quotations = await Quotation.find({ 
      _id: { $in: quotationIds },
      status: 'received' 
    }).populate('vendor materials.material');

    if (quotations.length === 0) {
      return res.status(400).json({ message: '沒有可比較的報價' });
    }

    const comparison = [];
    const materialMap = new Map();

    quotations.forEach(quotation => {
      quotation.items.forEach(item => {
        const materialId = item.material.toString();
        if (!materialMap.has(materialId)) {
          materialMap.set(materialId, {
            material: item.material,
            vendors: []
          });
        }
        materialMap.get(materialId).vendors.push({
          vendor: quotation.vendor._id,
          vendorName: quotation.vendor.name,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          isLowest: false
        });
      });
    });

    materialMap.forEach((value, key) => {
      const minPrice = Math.min(...value.vendors.map(v => v.unitPrice));
      value.vendors.forEach(vendor => {
        vendor.isLowest = vendor.unitPrice === minPrice;
      });
      comparison.push(value);
    });

    const bestVendorScore = {};
    quotations.forEach(q => {
      bestVendorScore[q.vendor._id] = 0;
    });

    comparison.forEach(item => {
      item.vendors.forEach(vendor => {
        if (vendor.isLowest) {
          bestVendorScore[vendor.vendor] = (bestVendorScore[vendor.vendor] || 0) + 1;
        }
      });
    });

    const recommendedVendorId = Object.keys(bestVendorScore).reduce((a, b) => 
      bestVendorScore[a] > bestVendorScore[b] ? a : b
    );

    const priceComparison = new PriceComparison({
      project: projectId,
      quotations: quotationIds,
      comparison,
      recommendedVendor: recommendedVendorId,
      status: 'completed'
    });

    await priceComparison.save();
    await priceComparison.populate('quotations.vendor recommendedVendor');

    res.status(201).json({ 
      message: '計價比較表生成完成', 
      priceComparison 
    });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

router.post('/purchase-orders', authenticateToken, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const { projectId, vendorId, items, paymentTerms, deliveryAddress } = req.body;

    if (!projectId || !vendorId || !items || !Array.isArray(items)) {
      return res.status(400).json({ message: '請填寫所有必填欄位' });
    }

    const project = await Project.findById(projectId);
    const vendor = await Vendor.findById(vendorId);

    if (!project || !vendor) {
      return res.status(404).json({ message: '專案或廠商不存在' });
    }

    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

    if (project.budget.remaining < totalAmount) {
      return res.status(400).json({ message: '預算不足，無法下單' });
    }

    const poNumber = generatePONumber();
    
    const purchaseOrder = new PurchaseOrder({
      poNumber,
      project: project._id,
      vendor: vendor._id,
      items,
      totalAmount,
      paymentTerms,
      deliveryAddress,
      approvedBy: req.user._id,
      approvedAt: new Date(),
      status: 'confirmed'
    });

    await purchaseOrder.save();

    project.budget.remaining -= totalAmount;
    project.budget.allocated += totalAmount;
    project.actualCost += totalAmount;
    await project.save();

    await voucherService.createPurchaseVoucher(purchaseOrder, req.user._id);
    await emailService.sendPurchaseOrderToVendor(vendor.email, purchaseOrder);

    res.status(201).json({ 
      message: '採購單生成成功，預算已扣除', 
      purchaseOrder 
    });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

router.get('/purchase-orders', authenticateToken, async (req, res) => {
  try {
    const { projectId, status } = req.query;
    let filter = {};

    if (projectId) filter.project = projectId;
    if (status) filter.status = status;

    const purchaseOrders = await PurchaseOrder.find(filter)
      .populate('project', 'name projectId')
      .populate('vendor', 'name companyName')
      .populate('items.material')
      .populate('approvedBy', 'username')
      .sort({ createdAt: -1 });

    res.json({ purchaseOrders });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

router.put('/purchase-orders/:id/receive', authenticateToken, async (req, res) => {
  try {
    const { receivedItems } = req.body;
    
    const purchaseOrder = await PurchaseOrder.findById(req.params.id);
    if (!purchaseOrder) {
      return res.status(404).json({ message: '採購單不存在' });
    }

    let allReceived = true;
    purchaseOrder.items.forEach((item, index) => {
      if (receivedItems[index]) {
        item.receivedQuantity += receivedItems[index].quantity;
      }
      if (item.receivedQuantity < item.quantity) {
        allReceived = false;
      }
    });

    purchaseOrder.status = allReceived ? 'completed' : 'partially_received';
    await purchaseOrder.save();

    res.json({ 
      message: '收貨記錄更新成功', 
      purchaseOrder 
    });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

module.exports = router;