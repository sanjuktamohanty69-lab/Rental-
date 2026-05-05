/**
 * Supplier controller
 */
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const RestockLog = require('../models/RestockLog');

exports.getAllSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });
    res.json({ success: true, count: suppliers.length, data: suppliers });
  } catch (err) {
    next(err);
  }
};

exports.getSupplierById = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      const err = new Error('Supplier not found');
      err.statusCode = 404;
      return next(err);
    }
    const productsSupplied = await Product.find({ supplier: req.params.id }).select('name category stock_qty');
    res.json({ success: true, data: { supplier, productsSupplied } });
  } catch (err) {
    next(err);
  }
};

exports.createSupplier = async (req, res, next) => {
  try {
    const { name, contact, email, city } = req.body;
    if (!name) {
      const err = new Error('Supplier name is required');
      err.statusCode = 400;
      return next(err);
    }
    const supplier = new Supplier({ name, contact, email, city });
    await supplier.save();
    res.status(201).json({ success: true, data: supplier });
  } catch (err) {
    next(err);
  }
};

exports.updateSupplier = async (req, res, next) => {
  try {
    const updated = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) {
      const err = new Error('Supplier not found');
      err.statusCode = 404;
      return next(err);
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

exports.deleteSupplier = async (req, res, next) => {
  try {
    const existing = await RestockLog.findOne({ supplier: req.params.id });
    if (existing) {
      const err = new Error('Supplier has restock history, cannot delete');
      err.statusCode = 400;
      return next(err);
    }
    const deleted = await Supplier.findByIdAndDelete(req.params.id);
    if (!deleted) {
      const err = new Error('Supplier not found');
      err.statusCode = 404;
      return next(err);
    }
    res.json({ success: true, message: 'Supplier deleted' });
  } catch (err) {
    next(err);
  }
};

exports.getRestocksBySupplier = async (req, res, next) => {
  try {
    const restocks = await RestockLog.find({ supplier: req.params.id }).populate('product', 'name category').sort({ date: -1 });
    res.json({ success: true, count: restocks.length, data: restocks });
  } catch (err) {
    next(err);
  }
};
