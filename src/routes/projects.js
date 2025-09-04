const express = require('express');
const { getModels } = require('../models');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ message: 'Projects route is working' });
});

router.get('/', async (req, res) => {
  try {
    const { Project } = getModels();
    const projects = await Project.findAll();
    res.json(projects);
  } catch (error) {
    console.error('Projects fetch error:', error);
    res.status(500).json({ message: '獲取專案列表失敗' });
  }
});

module.exports = router;