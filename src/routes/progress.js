const express = require('express');
const { ProgressSchedule, DeliveryTracking, ProgressReport } = require('../models/Progress');
const { PurchaseOrder } = require('../models/Purchase');
const Project = require('../models/Project');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { isDeadlineApproaching, isOverdue, calculateProgress } = require('../utils/helpers');
const emailService = require('../services/emailService');

const router = express.Router();

router.post('/schedule', authenticateToken, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const { projectId, tasks } = req.body;

    if (!projectId || !tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ message: '請提供專案ID和任務清單' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: '專案不存在' });
    }

    const schedule = new ProgressSchedule({
      project: project._id,
      tasks: tasks.map((task, index) => ({
        taskId: `TASK-${Date.now()}-${index + 1}`,
        ...task,
        status: 'not_started',
        progress: 0
      })),
      overallProgress: 0
    });

    await schedule.save();
    
    res.status(201).json({ 
      message: '施工進度表創建成功', 
      schedule 
    });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

router.get('/schedule/:projectId', authenticateToken, async (req, res) => {
  try {
    const schedule = await ProgressSchedule.findOne({ project: req.params.projectId })
      .populate('project', 'name projectId')
      .populate('tasks.assignedTo', 'username email');

    if (!schedule) {
      return res.status(404).json({ message: '找不到該專案的進度表' });
    }

    const delayedTasks = schedule.tasks.filter(task => 
      task.endDate && isOverdue(task.endDate) && task.status !== 'completed'
    );

    const upcomingDeadlines = schedule.tasks.filter(task => 
      task.endDate && isDeadlineApproaching(task.endDate)
    );

    res.json({ 
      schedule,
      alerts: {
        delayedTasks: delayedTasks.length,
        upcomingDeadlines: upcomingDeadlines.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

router.put('/schedule/:id/task/:taskId', authenticateToken, async (req, res) => {
  try {
    const { progress, status, actualStartDate, actualEndDate, notes } = req.body;
    
    const schedule = await ProgressSchedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ message: '進度表不存在' });
    }

    const task = schedule.tasks.find(t => t.taskId === req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: '任務不存在' });
    }

    if (progress !== undefined) task.progress = Math.max(0, Math.min(100, progress));
    if (status) task.status = status;
    if (actualStartDate) task.actualStartDate = actualStartDate;
    if (actualEndDate) task.actualEndDate = actualEndDate;
    if (notes) task.notes = notes;

    if (progress === 100) {
      task.status = 'completed';
      task.actualEndDate = task.actualEndDate || new Date();
    } else if (progress > 0 && task.status === 'not_started') {
      task.status = 'in_progress';
      task.actualStartDate = task.actualStartDate || new Date();
    }

    const completedTasks = schedule.tasks.filter(t => t.status === 'completed').length;
    schedule.overallProgress = calculateProgress(completedTasks, schedule.tasks.length);
    schedule.lastUpdated = new Date();

    await schedule.save();

    if (progress === 100) {
      await emailService.sendTaskCompletionNotification(task, req.user);
    }

    await emailService.sendProgressUpdateToManagement(schedule);

    res.json({ message: '任務進度更新成功', task });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

router.post('/delivery-tracking', authenticateToken, async (req, res) => {
  try {
    const { purchaseOrderId } = req.body;

    const purchaseOrder = await PurchaseOrder.findById(purchaseOrderId);
    if (!purchaseOrder) {
      return res.status(404).json({ message: '採購單不存在' });
    }

    const deliveryTracking = new DeliveryTracking({
      purchaseOrder: purchaseOrder._id,
      deliveries: [],
      status: 'pending'
    });

    await deliveryTracking.save();
    
    res.status(201).json({ 
      message: '交貨追蹤創建成功', 
      deliveryTracking 
    });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

router.post('/delivery-tracking/:id/delivery', authenticateToken, async (req, res) => {
  try {
    const { deliveryDate, items, notes } = req.body;

    const tracking = await DeliveryTracking.findById(req.params.id)
      .populate('purchaseOrder');

    if (!tracking) {
      return res.status(404).json({ message: '交貨追蹤不存在' });
    }

    const delivery = {
      deliveryDate: deliveryDate || new Date(),
      items,
      receivedBy: req.user._id,
      notes
    };

    tracking.deliveries.push(delivery);

    const totalDelivered = {};
    tracking.deliveries.forEach(delivery => {
      delivery.items.forEach(item => {
        const materialId = item.material.toString();
        totalDelivered[materialId] = (totalDelivered[materialId] || 0) + item.quantity;
      });
    });

    const purchaseOrder = tracking.purchaseOrder;
    let allDelivered = true;
    let partiallyDelivered = false;

    purchaseOrder.items.forEach(item => {
      const materialId = item.material.toString();
      const deliveredQuantity = totalDelivered[materialId] || 0;
      
      if (deliveredQuantity < item.quantity) {
        allDelivered = false;
      }
      if (deliveredQuantity > 0) {
        partiallyDelivered = true;
      }
    });

    tracking.status = allDelivered ? 'completed' : (partiallyDelivered ? 'partial' : 'pending');
    
    await tracking.save();

    res.json({ message: '交貨記錄新增成功', tracking });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

router.get('/reports/:projectId', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    const schedule = await ProgressSchedule.findOne({ project: req.params.projectId })
      .populate('tasks.assignedTo', 'username');

    if (!project || !schedule) {
      return res.status(404).json({ message: '專案或進度表不存在' });
    }

    const completedTasks = schedule.tasks.filter(t => t.status === 'completed').length;
    const delayedTasks = schedule.tasks.filter(task => 
      task.endDate && isOverdue(task.endDate) && task.status !== 'completed'
    ).map(task => ({
      task: task.name,
      delayDays: Math.abs(new Date(task.endDate) - new Date()) / (1000 * 60 * 60 * 24),
      reason: task.notes || '未提供原因'
    }));

    const upcomingDeadlines = schedule.tasks.filter(task => 
      task.endDate && isDeadlineApproaching(task.endDate, 7)
    ).map(task => ({
      task: task.name,
      deadline: task.endDate,
      status: task.status
    }));

    const budgetStatus = {
      allocated: project.budget.allocated,
      spent: project.actualCost,
      remaining: project.budget.remaining
    };

    const issues = [];
    const recommendations = [];

    if (delayedTasks.length > 0) {
      issues.push(`有 ${delayedTasks.length} 個任務延誤`);
      recommendations.push('建議重新評估延誤任務的資源配置');
    }

    if (budgetStatus.remaining < budgetStatus.allocated * 0.2) {
      issues.push('預算即將用完');
      recommendations.push('建議控制後續支出並檢視預算配置');
    }

    const report = new ProgressReport({
      project: project._id,
      overallProgress: schedule.overallProgress,
      completedTasks,
      totalTasks: schedule.tasks.length,
      delayedTasks,
      upcomingDeadlines,
      budgetStatus,
      issues,
      recommendations,
      generatedBy: req.user._id
    });

    await report.save();

    res.json({ message: '進度報告生成成功', report });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

router.get('/alerts/:projectId', authenticateToken, async (req, res) => {
  try {
    const schedule = await ProgressSchedule.findOne({ project: req.params.projectId });
    const purchaseOrders = await PurchaseOrder.find({ project: req.params.projectId });

    if (!schedule) {
      return res.json({ alerts: [] });
    }

    const alerts = [];

    schedule.tasks.forEach(task => {
      if (task.endDate && isOverdue(task.endDate) && task.status !== 'completed') {
        alerts.push({
          type: 'delay',
          priority: 'high',
          message: `任務 "${task.name}" 已延誤`,
          taskId: task.taskId,
          delayDays: Math.ceil((new Date() - new Date(task.endDate)) / (1000 * 60 * 60 * 24))
        });
      } else if (task.endDate && isDeadlineApproaching(task.endDate, 3)) {
        alerts.push({
          type: 'deadline',
          priority: 'medium',
          message: `任務 "${task.name}" 即將到期`,
          taskId: task.taskId,
          daysLeft: Math.ceil((new Date(task.endDate) - new Date()) / (1000 * 60 * 60 * 24))
        });
      }
    });

    purchaseOrders.forEach(po => {
      po.items.forEach(item => {
        if (item.deliveryDate && isOverdue(item.deliveryDate) && item.receivedQuantity < item.quantity) {
          alerts.push({
            type: 'delivery_delay',
            priority: 'medium',
            message: `採購單 ${po.poNumber} 的材料交期延誤`,
            poNumber: po.poNumber,
            materialName: item.material.name
          });
        }
      });
    });

    res.json({ alerts });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

module.exports = router;