/**
 * Report controller
 */
const Order = require('../models/Order');
const Product = require('../models/Product');
const RestockLog = require('../models/RestockLog');
const Supplier = require('../models/Supplier');
const Customer = require('../models/Customer');
const mongoose = require('mongoose');

// Helper to parse dates
const parseDateRange = (startDate, endDate) => {
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate ? new Date(startDate) : new Date(end.getTime() - 1000 * 60 * 60 * 24 * 30);
  // Normalize time
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

exports.getSalesSummary = async (req, res, next) => {
  try {
    const { start, end } = parseDateRange(req.query.startDate, req.query.endDate);

    const pipeline = [
      { $match: { status: 'Completed', order_date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$order_date' } },
          totalRevenue: { $sum: '$total_amt' },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: '$total_amt' }
        }
      },
      { $sort: { _id: 1 } }
    ];

    const daily = await Order.aggregate(pipeline);

    const grandAgg = await Order.aggregate([
      { $match: { status: 'Completed', order_date: { $gte: start, $lte: end } } },
      { $group: { _id: null, grandTotal: { $sum: '$total_amt' }, totalOrders: { $sum: 1 } } }
    ]);

    const grand = grandAgg[0] || { grandTotal: 0, totalOrders: 0 };
    const daysInPeriod = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const avgDaily = grand.grandTotal / daysInPeriod;

    res.json({
      period: { start: start.toISOString(), end: end.toISOString() },
      daily,
      summary: { grandTotal: grand.grandTotal || 0, totalOrders: grand.totalOrders || 0, avgDaily }
    });
  } catch (err) {
    next(err);
  }
};

exports.getTopProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    const { start, end } = parseDateRange(req.query.startDate, req.query.endDate);

    const pipeline = [
      { $match: { status: 'Completed', order_date: { $gte: start, $lte: end } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          units_sold: { $sum: '$items.quantity' },
          total_revenue: { $sum: { $multiply: ['$items.quantity', '$items.unit_price'] } }
        }
      },
      { $sort: { units_sold: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          product: { _id: '$product._id', name: '$product.name', category: '$product.category' },
          units_sold: 1,
          total_revenue: 1
        }
      }
    ];

    const result = await Order.aggregate(pipeline);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getInventoryStatus = async (req, res, next) => {
  try {
    const products = await Product.find().populate('supplier', 'name city');
    const productsWithVirtuals = products.map((p) => p.toObject({ virtuals: true }));

    const totalProducts = products.length;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalStockValue = 0;
    for (const p of productsWithVirtuals) {
      if (p.stock_qty <= p.reorder_lvl) lowStockCount++;
      if (p.stock_qty === 0) outOfStockCount++;
      totalStockValue += (p.price || 0) * (p.stock_qty || 0);
    }

    res.json({ success: true, allProducts: productsWithVirtuals, summary: { totalProducts, lowStockCount, outOfStockCount, totalStockValue } });
  } catch (err) {
    next(err);
  }
};

exports.getSupplierRestockReport = async (req, res, next) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: '$supplier',
          totalRestocks: { $sum: 1 },
          totalQtyAdded: { $sum: '$qty_added' },
          lastRestockDate: { $max: '$date' }
        }
      },
      { $sort: { totalQtyAdded: -1 } },
      {
        $lookup: {
          from: 'suppliers',
          localField: '_id',
          foreignField: '_id',
          as: 'supplier'
        }
      },
      { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: true } },
      { $project: { supplier: { _id: '$supplier._id', name: '$supplier.name', city: '$supplier.city' }, totalRestocks: 1, totalQtyAdded: 1, lastRestockDate: 1 } }
    ];

    const data = await RestockLog.aggregate(pipeline);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getCustomerReport = async (req, res, next) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: '$customer',
          totalOrders: { $sum: 1 },
          totalSpend: { $sum: '$total_amt' },
          lastOrderDate: { $max: '$order_date' }
        }
      },
      { $sort: { totalSpend: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
      { $project: { customer: { _id: '$customer._id', name: '$customer.name', phone: '$customer.phone' }, totalOrders: 1, totalSpend: 1, lastOrderDate: 1 } }
    ];

    const data = await Order.aggregate(pipeline);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
