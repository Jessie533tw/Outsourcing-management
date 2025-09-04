const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ message: 'Purchases route is working' });
});

module.exports = router;