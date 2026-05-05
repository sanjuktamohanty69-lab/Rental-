const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.get('/sales-summary', protect, reportController.getSalesSummary);
router.get('/top-products', protect, reportController.getTopProducts);
router.get('/inventory-status', protect, reportController.getInventoryStatus);
router.get('/supplier-restock', protect, reportController.getSupplierRestockReport);
router.get('/customer-report', protect, reportController.getCustomerReport);

module.exports = router;
