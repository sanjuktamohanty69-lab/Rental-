const express = require('express');
const router = express.Router();

// GET /api/orders
router.get('/', (req, res) => {
  res.json({ message: 'Orders route' });
});

module.exports = router;
