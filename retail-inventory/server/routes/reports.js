const express = require('express');
const router = express.Router();

// GET /api/reports
router.get('/', (req, res) => {
  res.json({ message: 'Reports route' });
});

module.exports = router;
