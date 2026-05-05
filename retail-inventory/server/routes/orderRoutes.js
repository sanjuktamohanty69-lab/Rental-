const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, orderController.getAllOrders);
router.get('/:id', protect, orderController.getOrderById);
router.post('/', protect, orderController.createOrder);
router.patch('/:id/status', protect, authorize('admin'), orderController.updateOrderStatus);
router.delete('/:id', protect, authorize('admin'), orderController.deleteOrder);

module.exports = router;
