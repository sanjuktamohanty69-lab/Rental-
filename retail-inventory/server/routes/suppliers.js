const express = require('express');
const router = express.Router();

// GET /api/suppliers
router.get('/', (req, res) => {
  res.json({ message: 'Suppliers route' });
});

module.exports = router;
