const express = require('express');
const router = express.Router();

// GET /api/restock
router.get('/', (req, res) => {
  res.json({ message: 'Restock route' });
});

module.exports = router;
