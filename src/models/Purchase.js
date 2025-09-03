const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
  quotationId: {
    type: String,
    required: true,
    unique: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  materialAnalysis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MaterialAnalysis'
  },
  items: [{
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material'
    },
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number,
    notes: String
  }],
  totalAmount: Number,
  validUntil: Date,
  status: {
    type: String,
    enum: ['sent', 'received', 'selected', 'rejected'],
    default: 'sent'
  },
  submittedAt: Date
}, {
  timestamps: true
});

const priceComparisonSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  quotations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotation'
  }],
  comparison: [{
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material'
    },
    vendors: [{
      vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor'
      },
      unitPrice: Number,
      totalPrice: Number,
      isLowest: Boolean
    }]
  }],
  recommendedVendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  status: {
    type: String,
    enum: ['comparing', 'completed'],
    default: 'comparing'
  }
}, {
  timestamps: true
});

const purchaseOrderSchema = new mongoose.Schema({
  poNumber: {
    type: String,
    required: true,
    unique: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  items: [{
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material'
    },
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number,
    deliveryDate: Date,
    receivedQuantity: {
      type: Number,
      default: 0
    }
  }],
  totalAmount: Number,
  paymentTerms: String,
  deliveryAddress: String,
  status: {
    type: String,
    enum: ['draft', 'sent', 'confirmed', 'partially_received', 'completed', 'cancelled'],
    default: 'draft'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date
}, {
  timestamps: true
});

const Quotation = mongoose.model('Quotation', quotationSchema);
const PriceComparison = mongoose.model('PriceComparison', priceComparisonSchema);
const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);

module.exports = { Quotation, PriceComparison, PurchaseOrder };