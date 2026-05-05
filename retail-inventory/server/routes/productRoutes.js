const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, productController.getAllProducts);
router.get('/low-stock', protect, productController.getLowStockProducts);
router.get('/:id', protect, productController.getProductById);
router.post('/', protect, authorize('admin'), productController.createProduct);
router.put('/:id', protect, authorize('admin'), productController.updateProduct);
router.delete('/:id', protect, authorize('admin'), productController.deleteProduct);

module.exports = router;
