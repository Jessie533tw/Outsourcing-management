const express = require('express');
const Project = require('../models/Project');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { generateProjectId, generateContractNumber } = require('../utils/helpers');
const emailService = require('../services/emailService');

const router = express.Router();

router.post('/', authenticateToken, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const { name, description, location, client, startDate, endDate, estimatedCost } = req.body;

    if (!name || !location || !client || !startDate || !endDate || !estimatedCost) {
      return res.status(400).json({ message: '請填寫所有必填欄位' });
    }

    const projectId = generateProjectId();
    
    const project = new Project({
      projectId,
      name,
      description,
      location,
      client,
      startDate,
      endDate,
      estimatedCost,
      budget: {
        total: estimatedCost,
        remaining: estimatedCost,
        allocated: 0
      },
      manager: req.user._id
    });

    await project.save();

    res.status(201).json({
      message: '專案創建成功',
      project
    });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, manager } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (manager) filter.manager = manager;

    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      filter.manager = req.user._id;
    }

    const projects = await Project.find(filter)
      .populate('manager', 'username email department')
      .populate('approvals.approver', 'username email')
      .sort({ createdAt: -1 });

    res.json({ projects });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('manager', 'username email department')
      .populate('approvals.approver', 'username email');

    if (!project) {
      return res.status(404).json({ message: '專案不存在' });
    }

    res.json({ project });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

router.put('/:id/budget', authenticateToken, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const { total } = req.body;
    
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: '專案不存在' });
    }

    if (project.status !== 'planning') {
      return res.status(400).json({ message: '只有規劃中的專案可以修改預算' });
    }

    project.budget = {
      total,
      remaining: total - project.budget.allocated,
      allocated: project.budget.allocated
    };
    project.estimatedCost = total;
    project.status = 'pending_approval';

    await project.save();

    await emailService.sendBudgetApprovalRequest(project);

    res.json({ message: '預算更新成功，已送出審核', project });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

router.post('/:id/approve', authenticateToken, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const { status, comment } = req.body;
    
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: '專案不存在' });
    }

    const approval = {
      approver: req.user._id,
      status,
      comment,
      approvedAt: new Date()
    };

    project.approvals.push(approval);

    if (status === 'approved') {
      project.status = 'approved';
      project.contractNumber = generateContractNumber(project.projectId);
      
      await emailService.sendContractToAccounting(project);
    } else if (status === 'rejected') {
      project.status = 'planning';
    }

    await project.save();

    res.json({ message: '審核完成', project });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: '專案不存在' });
    }

    res.json({ message: '專案刪除成功' });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

module.exports = router;