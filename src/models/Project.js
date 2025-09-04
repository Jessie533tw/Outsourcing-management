const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Project = sequelize.define('Project', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    projectId: {
      type: DataTypes.STRING,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  location: String,
  client: String,
  startDate: Date,
  endDate: Date,
  estimatedCost: Number,
  actualCost: {
    type: Number,
    default: 0
  },
  budget: {
    total: Number,
    remaining: Number,
    allocated: Number
  },
  status: {
    type: String,
    enum: ['planning', 'pending_approval', 'approved', 'in_progress', 'completed', 'suspended'],
    default: 'planning'
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvals: [{
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected']
    },
    comment: String,
    approvedAt: Date
  }],
  contractNumber: String,
  documents: [{
    name: String,
    path: String,
    type: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);