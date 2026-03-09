// badge.routes.js
const express = require('express');
const router = express.Router();
const Badge = require('../models/badge.model');

// Create a badge
router.post('/', async (req, res) => {
  try {
    const { userId, milestone, name, icon, type } = req.body;

    const badge = await Badge.create({ userId, milestone, name, icon, type });

    res.status(201).json({
      status: 'success',
      data: badge
    });
  } catch (err) {
    if (err.code === 11000) { // Mongo duplicate key error
      return res.status(400).json({ status: 'error', message: 'Badge already awarded' });
    }
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const badges = await Badge.find({ userId }).sort({ dateEarned: -1 });
    res.json(badges);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;