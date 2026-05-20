/**
 * Customer controller
 */
const Customer = require('../models/Customer');
const Order = require('../models/Order');

exports.getAllCustomers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) {
      const re = { $regex: search, $options: 'i' };
      filter.$or = [{ name: re }, { phone: re }, { email: re }];
    }
    const customers = await Customer.find(filter).sort({ name: 1 });
    res.json({ success: true, count: customers.length, data: customers });
  } catch (err) {
    next(err);
  }
};

exports.getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      const err = new Error('Customer not found');
      err.statusCode = 404;
      return next(err);
    }
    res.json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};

exports.getCustomerOrders = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      const err = new Error('Customer not found');
      err.statusCode = 404;
      return next(err);
    }
    const orders = await Order.find({ customer: req.params.id })
      .populate('items.product', 'name category price')
      .sort({ order_date: -1 });

    const totalSpend = orders.reduce((sum, o) => sum + (o.total_amt || 0), 0);
    res.json({ success: true, customer, orders, totalSpend, orderCount: orders.length });
  } catch (err) {
    next(err);
  }
};

exports.createCustomer = async (req, res, next) => {
  try {
    const { name, phone, email, address } = req.body;
    if (!name) {
      const err = new Error('Customer name is required');
      err.statusCode = 400;
      return next(err);
    }
    const customer = new Customer({ name, phone, email, address });
    await customer.save();
    res.status(201).json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};

exports.updateCustomer = async (req, res, next) => {
  try {
    const updated = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) {
      const err = new Error('Customer not found');
      err.statusCode = 404;
      return next(err);
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

exports.deleteCustomer = async (req, res, next) => {
  try {
    const existingOrder = await Order.findOne({ customer: req.params.id });
    if (existingOrder) {
      const err = new Error('Customer has order history');
      err.statusCode = 400;
      return next(err);
    }
    const deleted = await Customer.findByIdAndDelete(req.params.id);
    if (!deleted) {
      const err = new Error('Customer not found');
      err.statusCode = 404;
      return next(err);
    }
    res.json({ success: true, message: 'Customer deleted' });
  } catch (err) {
    next(err);
  }
};
