const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  materialId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  specification: String,
  standardPrice: Number,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const materialAnalysisSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  materials: [{
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material'
    },
    quantity: {
      type: Number,
      required: true
    },
    estimatedPrice: Number,
    notes: String
  }],
  totalEstimatedCost: Number,
  generatedFrom: String,
  status: {
    type: String,
    enum: ['draft', 'approved', 'sent_for_quotation'],
    default: 'draft'
  }
}, {
  timestamps: true
});

const Material = mongoose.model('Material', materialSchema);
const MaterialAnalysis = mongoose.model('MaterialAnalysis', materialAnalysisSchema);

module.exports = { Material, MaterialAnalysis };