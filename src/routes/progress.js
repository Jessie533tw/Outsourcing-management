const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ message: 'Progress route is working' });
});

module.exports = router;