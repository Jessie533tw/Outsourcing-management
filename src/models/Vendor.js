const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  vendorId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  companyName: String,
  contactPerson: String,
  email: String,
  phone: String,
  address: String,
  taxId: String,
  specialties: [String],
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  isActive: {
    type: Boolean,
    default: true
  },
  certifications: [String],
  paymentTerms: String,
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Vendor', vendorSchema);