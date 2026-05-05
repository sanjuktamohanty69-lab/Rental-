const express = require('express');
const router = express.Router();

// GET /api/products
router.get('/', (req, res) => {
  res.json({ message: 'Products route' });
});

module.exports = router;
