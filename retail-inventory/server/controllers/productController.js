/**
 * Product controller
 * CRUD and query endpoints for products
 */
const Product = require('../models/Product');
const Order = require('../models/Order');

// GET /api/products
exports.getAllProducts = async (req, res, next) => {
  try {
    const { category, lowStock, search } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (lowStock === 'true' || lowStock === true) {
      filter.$expr = { $lte: ['$stock_qty', '$reorder_lvl'] };
    }

    const total = await Product.countDocuments(filter);
    const data = await Product.find(filter)
      .populate('supplier', 'name city')
      .skip(skip)
      .limit(limit)
      .exec();

    res.json({ success: true, count: data.length, total, page, pages: Math.ceil(total / limit), data });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('supplier', 'name city');
    if (!product) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      return next(err);
    }
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    const { name, category, price, stock_qty, reorder_lvl, supplier } = req.body;
    if (!name || !category || price === undefined) {
      const err = new Error('name, category and price are required');
      err.statusCode = 400;
      return next(err);
    }
    const product = new Product({ name, category, price, stock_qty, reorder_lvl, supplier });
    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('supplier', 'name city');
    if (!updated) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      return next(err);
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const existingOrder = await Order.findOne({ 'items.product': productId });
    if (existingOrder) {
      const err = new Error('Cannot delete product with existing orders');
      err.statusCode = 400;
      return next(err);
    }
    const deleted = await Product.findByIdAndDelete(productId);
    if (!deleted) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      return next(err);
    }
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/low-stock
exports.getLowStockProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ $expr: { $lte: ['$stock_qty', '$reorder_lvl'] } }).sort({ stock_qty: 1 });
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    next(err);
  }
};
