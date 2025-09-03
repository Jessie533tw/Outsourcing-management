const express = require('express');
const Vendor = require('../models/Vendor');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { generateId } = require('../utils/helpers');

const router = express.Router();

router.post('/', authenticateToken, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const { name, companyName, contactPerson, email, phone, address, taxId, specialties, paymentTerms, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: '請填寫廠商名稱和聯絡電話' });
    }

    const vendorId = generateId('VEN');
    
    const vendor = new Vendor({
      vendorId,
      name,
      companyName,
      contactPerson,
      email,
      phone,
      address,
      taxId,
      specialties: specialties || [],
      paymentTerms,
      notes
    });

    await vendor.save();
    res.status(201).json({ message: '廠商新增成功', vendor });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { specialty, isActive } = req.query;
    let filter = {};

    if (specialty) filter.specialties = { $in: [specialty] };
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const vendors = await Vendor.find(filter).sort({ name: 1 });
    res.json({ vendors });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: '廠商不存在' });
    }
    res.json({ vendor });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

router.put('/:id', authenticateToken, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!vendor) {
      return res.status(404).json({ message: '廠商不存在' });
    }

    res.json({ message: '廠商資料更新成功', vendor });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

router.put('/:id/rating', authenticateToken, async (req, res) => {
  try {
    const { rating } = req.body;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: '評分必須在 1-5 之間' });
    }

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { rating },
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({ message: '廠商不存在' });
    }

    res.json({ message: '廠商評分更新成功', vendor });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({ message: '廠商不存在' });
    }

    res.json({ message: '廠商已停用' });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

module.exports = router;