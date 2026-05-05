/**
 * Database seed script for demo data
 * Run: node seed.js
 */
const mongoose = require('mongoose');
const connectDB = require('./db');
const User = require('../models/User');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const RestockLog = require('../models/RestockLog');

const run = async () => {
  try {
    await connectDB();

    // Clear collections
    await Promise.all([
      User.deleteMany({}),
      Supplier.deleteMany({}),
      Product.deleteMany({}),
      Customer.deleteMany({}),
      Order.deleteMany({}),
      RestockLog.deleteMany({})
    ]);

    // Users
    const admin = await User.create({ username: 'admin', password: 'admin123', role: 'admin' });
    const staff = await User.create({ username: 'staff1', password: 'staff123', role: 'staff' });

    // Suppliers
    const suppliers = await Supplier.insertMany([
      { name: 'Global Electronics', contact: 'Alice', email: 'alice@ge.com', city: 'San Francisco' },
      { name: 'Fresh Farms', contact: 'Bob', email: 'bob@fresh.com', city: 'Los Angeles' },
      { name: 'Style Wear', contact: 'Carol', email: 'carol@style.com', city: 'New York' },
      { name: 'OfficeGoods', contact: 'Dave', email: 'dave@office.com', city: 'Chicago' }
    ]);

    // Products (12 across 4 categories)
    const productsData = [
      { name: 'Wireless Mouse', category: 'Electronics', price: 25.99, stock_qty: 50, supplier: suppliers[0]._id },
      { name: 'USB-C Charger', category: 'Electronics', price: 19.99, stock_qty: 5, supplier: suppliers[0]._id },
      { name: 'Bluetooth Speaker', category: 'Electronics', price: 45.0, stock_qty: 8, supplier: suppliers[0]._id },

      { name: 'Organic Apples (1kg)', category: 'Grocery', price: 3.5, stock_qty: 100, supplier: suppliers[1]._id },
      { name: 'Olive Oil 500ml', category: 'Grocery', price: 12.0, stock_qty: 20, supplier: suppliers[1]._id },
      { name: 'Granola Bars', category: 'Grocery', price: 5.0, stock_qty: 2, supplier: suppliers[1]._id },

      { name: 'Denim Jeans', category: 'Clothing', price: 40.0, stock_qty: 15, supplier: suppliers[2]._id },
      { name: 'Cotton T-Shirt', category: 'Clothing', price: 12.0, stock_qty: 30, supplier: suppliers[2]._id },
      { name: 'Leather Belt', category: 'Clothing', price: 22.0, stock_qty: 3, supplier: suppliers[2]._id },

      { name: 'Notebook A5', category: 'Stationery', price: 4.0, stock_qty: 60, supplier: suppliers[3]._id },
      { name: 'Ballpoint Pens (10)', category: 'Stationery', price: 2.5, stock_qty: 200, supplier: suppliers[3]._id },
      { name: 'Stapler', category: 'Stationery', price: 8.0, stock_qty: 0, supplier: suppliers[3]._id }
    ];

    const products = [];
    for (const p of productsData) {
      const created = await Product.create(p);
      products.push(created);
    }

    // Customers
    const customers = await Customer.insertMany([
      { name: 'John Doe', phone: '555-1111', email: 'john@example.com', address: '123 Elm St' },
      { name: 'Jane Smith', phone: '555-2222', email: 'jane@example.com', address: '456 Oak Ave' },
      { name: 'Bob Johnson', phone: '555-3333', email: 'bob@example.com', address: '789 Pine Rd' },
      { name: 'Sara Lee', phone: '555-4444', email: 'sara@example.com', address: '321 Maple St' },
      { name: 'Tom Cruise', phone: '555-5555', email: 'tom@example.com', address: '987 Cedar Ave' },
      { name: 'Emma Stone', phone: '555-6666', email: 'emma@example.com', address: '654 Birch Ln' }
    ]);

    // Orders: create 8 completed orders manually (use insertMany to bypass pre-save hooks)
    // We'll create varied orders using product ids
    const ordersToInsert = [];
    const now = new Date();

    function makeOrder(customerIndex, itemsArr, daysAgo = 0) {
      const orderDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      let total = 0;
      for (const it of itemsArr) {
        total += it.quantity * it.unit_price;
      }
      return { customer: customers[customerIndex]._id, order_date: orderDate, items: itemsArr, total_amt: total, payment_mode: 'Card', status: 'Completed' };
    }

    ordersToInsert.push(makeOrder(0, [ { product: products[0]._id, quantity: 2, unit_price: 25.99 } ], 2));
    ordersToInsert.push(makeOrder(1, [ { product: products[3]._id, quantity: 5, unit_price: 3.5 } ], 5));
    ordersToInsert.push(makeOrder(2, [ { product: products[6]._id, quantity: 1, unit_price: 40.0 }, { product: products[9]._id, quantity: 3, unit_price: 4.0 } ], 10));
    ordersToInsert.push(makeOrder(3, [ { product: products[1]._id, quantity: 1, unit_price: 19.99 } ], 1));
    ordersToInsert.push(makeOrder(4, [ { product: products[10]._id, quantity: 20, unit_price: 2.5 } ], 3));
    ordersToInsert.push(makeOrder(5, [ { product: products[4]._id, quantity: 2, unit_price: 12.0 } ], 7));
    ordersToInsert.push(makeOrder(0, [ { product: products[2]._id, quantity: 1, unit_price: 45.0 } ], 15));
    ordersToInsert.push(makeOrder(1, [ { product: products[5]._id, quantity: 1, unit_price: 5.0 } ], 20));

    // Insert orders without triggering pre-save hooks
    const insertedOrders = await Order.insertMany(ordersToInsert);

    // Manually decrement product stock according to inserted orders
    for (const ord of ordersToInsert) {
      for (const it of ord.items) {
        await Product.findByIdAndUpdate(it.product, { $inc: { stock_qty: -Math.abs(it.quantity) } });
      }
    }

    // Restock logs: create 6 entries but insertMany to bypass post-save hook, then manually apply stock increases
    const restocksToInsert = [
      { product: products[1]._id, supplier: suppliers[0]._id, date: new Date(), qty_added: 10 },
      { product: products[5]._id, supplier: suppliers[1]._id, date: new Date(), qty_added: 50 },
      { product: products[6]._id, supplier: suppliers[2]._id, date: new Date(), qty_added: 20 },
      { product: products[11]._id, supplier: suppliers[3]._id, date: new Date(), qty_added: 15 },
      { product: products[4]._id, supplier: suppliers[1]._id, date: new Date(), qty_added: 10 },
      { product: products[8]._id, supplier: suppliers[2]._id, date: new Date(), qty_added: 5 }
    ];

    const insertedRestocks = await RestockLog.insertMany(restocksToInsert);

    for (const r of restocksToInsert) {
      await Product.findByIdAndUpdate(r.product, { $inc: { stock_qty: Math.abs(r.qty_added) } });
    }

    console.log(`✅ Seed complete: ${products.length} products, ${insertedOrders.length} orders, ${customers.length} customers seeded`);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

run();
