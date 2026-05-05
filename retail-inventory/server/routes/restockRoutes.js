const express = require('express');
const router = express.Router();
const restockController = require('../controllers/restockController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, restockController.getAllRestocks);
router.get('/:id', protect, restockController.getRestockById);
router.post('/', protect, authorize('admin', 'staff'), restockController.createRestock);

module.exports = router;
