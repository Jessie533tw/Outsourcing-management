const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  voucherNumber: {
    type: String,
    required: true,
    unique: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  type: {
    type: String,
    enum: ['material_purchase', 'service_payment', 'expense'],
    required: true
  },
  description: String,
  amount: {
    type: Number,
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  purchaseOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseOrder'
  },
  accountingEntry: {
    debit: [{
      account: String,
      amount: Number
    }],
    credit: [{
      account: String,
      amount: Number
    }]
  },
  status: {
    type: String,
    enum: ['draft', 'approved', 'processed'],
    default: 'draft'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Voucher', voucherSchema);