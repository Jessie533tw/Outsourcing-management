const express = require('express');
const Project = require('../models/Project');
const Voucher = require('../models/Voucher');
const { PurchaseOrder } = require('../models/Purchase');
const { ProgressReport } = require('../models/Progress');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const pdfService = require('../services/pdfService');

const router = express.Router();

router.get('/project-summary/:projectId', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('manager', 'username email');

    if (!project) {
      return res.status(404).json({ message: '專案不存在' });
    }

    const purchaseOrders = await PurchaseOrder.find({ project: project._id })
      .populate('vendor', 'name')
      .populate('items.material', 'name category');

    const vouchers = await Voucher.find({ project: project._id });

    const materialSummary = {};
    const vendorSummary = {};

    purchaseOrders.forEach(po => {
      if (!vendorSummary[po.vendor.name]) {
        vendorSummary[po.vendor.name] = {
          totalOrders: 0,
          totalAmount: 0,
          status: {}
        };
      }
      
      vendorSummary[po.vendor.name].totalOrders += 1;
      vendorSummary[po.vendor.name].totalAmount += po.totalAmount;
      vendorSummary[po.vendor.name].status[po.status] = 
        (vendorSummary[po.vendor.name].status[po.status] || 0) + 1;

      po.items.forEach(item => {
        const key = `${item.material.category}-${item.material.name}`;
        if (!materialSummary[key]) {
          materialSummary[key] = {
            category: item.material.category,
            name: item.material.name,
            totalQuantity: 0,
            totalCost: 0,
            receivedQuantity: 0
          };
        }
        materialSummary[key].totalQuantity += item.quantity;
        materialSummary[key].totalCost += item.totalPrice;
        materialSummary[key].receivedQuantity += item.receivedQuantity || 0;
      });
    });

    const budgetAnalysis = {
      budgetUtilization: (project.budget.allocated / project.budget.total) * 100,
      costVariance: project.actualCost - project.estimatedCost,
      remainingBudget: project.budget.remaining
    };

    const report = {
      project: {
        id: project._id,
        projectId: project.projectId,
        name: project.name,
        status: project.status,
        manager: project.manager
      },
      financial: {
        estimatedCost: project.estimatedCost,
        actualCost: project.actualCost,
        budget: project.budget,
        budgetAnalysis
      },
      procurement: {
        totalPurchaseOrders: purchaseOrders.length,
        totalProcurementValue: purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0),
        vendorSummary,
        materialSummary: Object.values(materialSummary)
      },
      accounting: {
        totalVouchers: vouchers.length,
        vouchersByType: vouchers.reduce((acc, v) => {
          acc[v.type] = (acc[v.type] || 0) + 1;
          return acc;
        }, {}),
        totalVoucherAmount: vouchers.reduce((sum, v) => sum + v.amount, 0)
      }
    };

    res.json({ report });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

router.get('/project-details/:projectId', authenticateToken, async (req, res) => {
  try {
    const { format } = req.query;
    
    const project = await Project.findById(req.params.projectId)
      .populate('manager', 'username email department');

    const purchaseOrders = await PurchaseOrder.find({ project: project._id })
      .populate('vendor', 'name companyName')
      .populate('items.material', 'name category unit')
      .populate('approvedBy', 'username');

    const vouchers = await Voucher.find({ project: project._id })
      .populate('vendor', 'name')
      .populate('createdBy', 'username')
      .populate('approvedBy', 'username');

    const progressReports = await ProgressReport.find({ project: project._id })
      .populate('generatedBy', 'username')
      .sort({ reportDate: -1 })
      .limit(5);

    const detailReport = {
      project,
      purchaseOrders,
      vouchers,
      progressReports,
      generatedAt: new Date(),
      generatedBy: req.user.username
    };

    if (format === 'pdf') {
      const pdfBuffer = await pdfService.generateProjectDetailReport(detailReport);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="project-${project.projectId}-detail.pdf"`);
      res.send(pdfBuffer);
    } else {
      res.json({ report: detailReport });
    }
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

router.get('/financial-summary', authenticateToken, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const { startDate, endDate, projectId } = req.query;
    
    let projectFilter = {};
    if (projectId) projectFilter._id = projectId;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const projects = await Project.find(projectFilter);
    const vouchers = await Voucher.find({
      ...dateFilter,
      ...(projectId && { project: projectId })
    }).populate('project', 'name projectId');

    const summary = {
      totalProjects: projects.length,
      projectsByStatus: projects.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {}),
      financialOverview: {
        totalBudget: projects.reduce((sum, p) => sum + (p.budget.total || 0), 0),
        totalAllocated: projects.reduce((sum, p) => sum + (p.budget.allocated || 0), 0),
        totalSpent: projects.reduce((sum, p) => sum + (p.actualCost || 0), 0),
        totalRemaining: projects.reduce((sum, p) => sum + (p.budget.remaining || 0), 0)
      },
      voucherSummary: {
        totalVouchers: vouchers.length,
        totalAmount: vouchers.reduce((sum, v) => sum + v.amount, 0),
        byType: vouchers.reduce((acc, v) => {
          acc[v.type] = {
            count: (acc[v.type]?.count || 0) + 1,
            amount: (acc[v.type]?.amount || 0) + v.amount
          };
          return acc;
        }, {}),
        byProject: vouchers.reduce((acc, v) => {
          const projectName = v.project.name;
          acc[projectName] = {
            count: (acc[projectName]?.count || 0) + 1,
            amount: (acc[projectName]?.amount || 0) + v.amount
          };
          return acc;
        }, {})
      }
    };

    res.json({ summary });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

router.post('/completion-report/:projectId', authenticateToken, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({ message: '專案不存在' });
    }

    if (project.status !== 'completed') {
      return res.status(400).json({ message: '只有完工專案可以生成完工報告' });
    }

    const vouchers = await Voucher.find({ project: project._id })
      .populate('vendor', 'name')
      .populate('createdBy', 'username')
      .sort({ createdAt: 1 });

    const purchaseOrders = await PurchaseOrder.find({ project: project._id })
      .populate('vendor', 'name')
      .populate('items.material', 'name category');

    const ledgerEntries = [];
    let totalDebit = 0;
    let totalCredit = 0;

    vouchers.forEach(voucher => {
      voucher.accountingEntry.debit.forEach(entry => {
        ledgerEntries.push({
          date: voucher.createdAt,
          voucherNumber: voucher.voucherNumber,
          account: entry.account,
          debit: entry.amount,
          credit: 0,
          description: voucher.description
        });
        totalDebit += entry.amount;
      });

      voucher.accountingEntry.credit.forEach(entry => {
        ledgerEntries.push({
          date: voucher.createdAt,
          voucherNumber: voucher.voucherNumber,
          account: entry.account,
          debit: 0,
          credit: entry.amount,
          description: voucher.description
        });
        totalCredit += entry.amount;
      });
    });

    const completionReport = {
      project: {
        projectId: project.projectId,
        name: project.name,
        completedAt: new Date(),
        duration: project.endDate ? Math.ceil((new Date(project.endDate) - new Date(project.startDate)) / (1000 * 60 * 60 * 24)) : null
      },
      financial: {
        finalCost: project.actualCost,
        budgetVariance: project.actualCost - project.estimatedCost,
        budgetUtilization: (project.actualCost / project.budget.total) * 100
      },
      procurement: {
        totalPurchaseOrders: purchaseOrders.length,
        totalProcurementValue: purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0),
        materialCategories: purchaseOrders.reduce((acc, po) => {
          po.items.forEach(item => {
            acc[item.material.category] = (acc[item.material.category] || 0) + item.totalPrice;
          });
          return acc;
        }, {})
      },
      accounting: {
        totalVouchers: vouchers.length,
        totalDebit,
        totalCredit,
        ledgerEntries: ledgerEntries.sort((a, b) => new Date(a.date) - new Date(b.date)),
        isBalanced: Math.abs(totalDebit - totalCredit) < 0.01
      },
      generatedAt: new Date(),
      generatedBy: req.user.username
    };

    const pdfBuffer = await pdfService.generateCompletionReport(completionReport);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="completion-report-${project.projectId}.pdf"`);
    res.send(pdfBuffer);

    await emailService.sendCompletionReportToAccounting(project, pdfBuffer);

  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

module.exports = router;