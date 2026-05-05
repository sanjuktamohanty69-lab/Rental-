const express = require('express');
const router = express.Router();

// GET /api/customers
router.get('/', (req, res) => {
  res.json({ message: 'Customers route' });
});

module.exports = router;
