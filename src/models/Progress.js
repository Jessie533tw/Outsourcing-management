const mongoose = require('mongoose');

const progressScheduleSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  tasks: [{
    taskId: String,
    name: String,
    description: String,
    startDate: Date,
    endDate: Date,
    actualStartDate: Date,
    actualEndDate: Date,
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'delayed'],
      default: 'not_started'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dependencies: [String],
    materials: [{
      material: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Material'
      },
      requiredQuantity: Number,
      availableQuantity: Number
    }]
  }],
  overallProgress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const deliveryTrackingSchema = new mongoose.Schema({
  purchaseOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseOrder',
    required: true
  },
  deliveries: [{
    deliveryDate: Date,
    items: [{
      material: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Material'
      },
      quantity: Number,
      condition: {
        type: String,
        enum: ['good', 'damaged', 'partial'],
        default: 'good'
      }
    }],
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  status: {
    type: String,
    enum: ['pending', 'partial', 'completed', 'delayed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

const progressReportSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  reportDate: {
    type: Date,
    default: Date.now
  },
  overallProgress: Number,
  completedTasks: Number,
  totalTasks: Number,
  delayedTasks: [{
    task: String,
    delayDays: Number,
    reason: String
  }],
  upcomingDeadlines: [{
    task: String,
    deadline: Date,
    status: String
  }],
  budgetStatus: {
    allocated: Number,
    spent: Number,
    remaining: Number
  },
  issues: [String],
  recommendations: [String],
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const ProgressSchedule = mongoose.model('ProgressSchedule', progressScheduleSchema);
const DeliveryTracking = mongoose.model('DeliveryTracking', deliveryTrackingSchema);
const ProgressReport = mongoose.model('ProgressReport', progressReportSchema);

module.exports = { ProgressSchedule, DeliveryTracking, ProgressReport };