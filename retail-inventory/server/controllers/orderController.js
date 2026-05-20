/**
 * Order controller
 */
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');

exports.getAllOrders = async (req, res, next) => {
  try {
    const { startDate, endDate, customerId, status } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (startDate || endDate) {
      filter.order_date = {};
      if (startDate) filter.order_date.$gte = new Date(startDate);
      if (endDate) filter.order_date.$lte = new Date(endDate);
    }
    if (customerId) {
      if (!mongoose.Types.ObjectId.isValid(customerId)) {
        const err = new Error('Invalid customerId');
        err.statusCode = 400;
        return next(err);
      }
      filter.customer = mongoose.Types.ObjectId(customerId);
    }
    if (status) filter.status = status;

    const total = await Order.countDocuments(filter);

    // total revenue for filtered set
    const revenueAgg = await Order.aggregate([
      { $match: filter },
      { $group: { _id: null, totalRevenue: { $sum: '$total_amt' } } }
    ]);
    const totalRevenue = (revenueAgg[0] && revenueAgg[0].totalRevenue) || 0;

    const data = await Order.find(filter)
      .populate('customer', 'name phone')
      .populate('items.product', 'name category')
      .sort({ order_date: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ success: true, count: data.length, total, page, pages: Math.ceil(total / limit), totalRevenue, data });
  } catch (err) {
    next(err);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name phone')
      .populate('items.product', 'name category');
    if (!order) {
      const err = new Error('Order not found');
      err.statusCode = 404;
      return next(err);
    }
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

exports.createOrder = async (req, res, next) => {
  try {
    const { customer, items, payment_mode } = req.body;
    if (!customer || !Array.isArray(items) || items.length === 0) {
      const err = new Error('Customer and items are required');
      err.statusCode = 400;
      return next(err);
    }

    const cust = await Customer.findById(customer);
    if (!cust) {
      const err = new Error('Customer not found');
      err.statusCode = 400;
      return next(err);
    }

    // Validate product existence and stock
    for (const it of items) {
      const prod = await Product.findById(it.product);
      if (!prod) {
        const err = new Error(`Product not found: ${it.product}`);
        err.statusCode = 400;
        return next(err);
      }
      if (prod.stock_qty < it.quantity) {
        const err = new Error(`Insufficient stock for product: ${prod.name}. Available: ${prod.stock_qty}`);
        err.statusCode = 400;
        return next(err);
      }
    }

    const order = new Order({ customer, items, payment_mode });
    await order.save(); // pre-save hook will calculate total and decrement stock

    const populated = await Order.findById(order._id)
      .populate('customer', 'name phone')
      .populate('items.product', 'name category');

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      const err = new Error('Status is required');
      err.statusCode = 400;
      return next(err);
    }
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) {
      const err = new Error('Order not found');
      err.statusCode = 404;
      return next(err);
    }
    const prevStatus = order.status;
    order.status = status;

    // If cancelling a previously Completed order, restore stock
    if (prevStatus === 'Completed' && status === 'Cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product._id, { $inc: { stock_qty: Math.abs(item.quantity) } });
      }
    }

    await order.save();
    const updated = await Order.findById(order._id).populate('customer', 'name phone').populate('items.product', 'name category');
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) {
      const err = new Error('Order not found');
      err.statusCode = 404;
      return next(err);
    }
    if (order.status !== 'Pending') {
      const err = new Error('Cannot delete a completed order');
      err.statusCode = 400;
      return next(err);
    }

    // Restore stock for items (since stock was decremented on create)
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product._id, { $inc: { stock_qty: Math.abs(item.quantity) } });
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Order deleted' });
  } catch (err) {
    next(err);
  }
};
