const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { protect } = require('../middleware/auth');

router.get('/', protect, customerController.getAllCustomers);
router.get('/:id', protect, customerController.getCustomerById);
router.get('/:id/orders', protect, customerController.getCustomerOrders);
router.post('/', protect, customerController.createCustomer);
router.put('/:id', protect, customerController.updateCustomer);
router.delete('/:id', protect, customerController.deleteCustomer);

module.exports = router;
