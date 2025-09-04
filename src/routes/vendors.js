const express = require('express');
const { getModels } = require('../models');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ message: 'Vendors route is working' });
});

module.exports = router;