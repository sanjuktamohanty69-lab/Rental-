const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, supplierController.getAllSuppliers);
router.get('/:id', protect, supplierController.getSupplierById);
router.get('/:id/restocks', protect, supplierController.getRestocksBySupplier);
router.post('/', protect, authorize('admin'), supplierController.createSupplier);
router.put('/:id', protect, authorize('admin'), supplierController.updateSupplier);
router.delete('/:id', protect, authorize('admin'), supplierController.deleteSupplier);

module.exports = router;
