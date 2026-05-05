/**
 * Restock controller
 */
const RestockLog = require('../models/RestockLog');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');

exports.getAllRestocks = async (req, res, next) => {
  try {
    const { productId, supplierId, startDate, endDate } = req.query;
    const filter = {};
    if (productId) filter.product = productId;
    if (supplierId) filter.supplier = supplierId;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const data = await RestockLog.find(filter)
      .populate('product', 'name category stock_qty')
      .populate('supplier', 'name city')
      .sort({ date: -1 });

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

exports.createRestock = async (req, res, next) => {
  try {
    const { product, supplier, qty_added, date } = req.body;
    if (!product || !supplier || !qty_added) {
      const err = new Error('product, supplier and qty_added are required');
      err.statusCode = 400;
      return next(err);
    }
    const prod = await Product.findById(product);
    if (!prod) {
      const err = new Error('Product not found');
      err.statusCode = 400;
      return next(err);
    }
    const sup = await Supplier.findById(supplier);
    if (!sup) {
      const err = new Error('Supplier not found');
      err.statusCode = 400;
      return next(err);
    }

    const restock = new RestockLog({ product, supplier, qty_added, date });
    await restock.save(); // post-save hook will increment product stock

    const populated = await RestockLog.findById(restock._id).populate('product', 'name category stock_qty').populate('supplier', 'name city');
    const updatedProduct = await Product.findById(product).select('stock_qty');

    res.status(201).json({ success: true, data: populated, updatedProduct });
  } catch (err) {
    next(err);
  }
};

exports.getRestockById = async (req, res, next) => {
  try {
    const restock = await RestockLog.findById(req.params.id).populate('product', 'name category stock_qty').populate('supplier', 'name city');
    if (!restock) {
      const err = new Error('Restock entry not found');
      err.statusCode = 404;
      return next(err);
    }
    res.json({ success: true, data: restock });
  } catch (err) {
    next(err);
  }
};
