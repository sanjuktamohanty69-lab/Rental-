/**
 * Large demo dataset seeder.
 * Generates a bigger dataset for presentations/testing.
 *
 * Usage:
 *   node config/seed-large.js
 *   ORDERS=1500 node config/seed-large.js
 */
const connectDB = require('./db');
const User = require('../models/User');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const RestockLog = require('../models/RestockLog');

const ORDER_COUNT = Number(process.env.ORDERS || 1000);
const PRODUCT_COUNT = 120;
const CUSTOMER_COUNT = 260;
const SUPPLIER_COUNT = 40;
const RESTOCK_COUNT = 320;

const categories = ['Electronics', 'Grocery', 'Clothing', 'Stationery', 'Home', 'Sports'];
const paymentModes = ['Cash', 'Card', 'UPI', 'Online'];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function randomDateInLastDays(days) {
  const now = Date.now();
  const offset = randInt(0, days * 24 * 60 * 60 * 1000);
  return new Date(now - offset);
}

function makeSuppliers() {
  const cities = ['Mumbai', 'Delhi', 'Bengaluru', 'Kolkata', 'Chennai', 'Pune', 'Hyderabad'];
  const docs = [];
  for (let i = 1; i <= SUPPLIER_COUNT; i += 1) {
    docs.push({
      name: `Supplier ${i}`,
      contact: `Contact ${i}`,
      email: `supplier${i}@demo.com`,
      city: pick(cities)
    });
  }
  return docs;
}

function makeProducts(suppliers) {
  const docs = [];
  for (let i = 1; i <= PRODUCT_COUNT; i += 1) {
    docs.push({
      name: `Product ${i}`,
      category: pick(categories),
      price: Number((randInt(200, 20000) / 100).toFixed(2)),
      stock_qty: randInt(40, 220),
      reorder_lvl: randInt(8, 30),
      supplier: pick(suppliers)._id,
      lowStockAlert: false
    });
  }
  return docs;
}

function makeCustomers() {
  const docs = [];
  for (let i = 1; i <= CUSTOMER_COUNT; i += 1) {
    docs.push({
      name: `Customer ${i}`,
      phone: `9${String(100000000 + i).slice(0, 9)}`,
      email: `customer${i}@demo.com`,
      address: `Address Line ${i}, Demo City`
    });
  }
  return docs;
}

function makeOrderItems(products) {
  const lineCount = randInt(1, 5);
  const used = new Set();
  const items = [];

  while (items.length < lineCount) {
    const p = pick(products);
    if (used.has(String(p._id))) continue;
    used.add(String(p._id));

    const quantity = randInt(1, 6);
    const discount = randInt(0, 15) / 100;
    const unitPrice = Number((p.price * (1 - discount)).toFixed(2));

    items.push({
      product: p._id,
      quantity,
      unit_price: unitPrice
    });
  }

  return items;
}

function computeTotal(items) {
  return Number(items.reduce((sum, it) => sum + it.quantity * it.unit_price, 0).toFixed(2));
}

async function run() {
  try {
    await connectDB();

    await Promise.all([
      User.deleteMany({}),
      Supplier.deleteMany({}),
      Product.deleteMany({}),
      Customer.deleteMany({}),
      Order.deleteMany({}),
      RestockLog.deleteMany({})
    ]);

    // Keep predictable login accounts for demo.
    await User.create({ username: 'admin', password: 'admin123', role: 'admin' });
    await User.create({ username: 'staff1', password: 'staff123', role: 'staff' });

    const suppliers = await Supplier.insertMany(makeSuppliers());
    const products = await Product.insertMany(makeProducts(suppliers));
    const customers = await Customer.insertMany(makeCustomers());

    const ordersToInsert = [];
    for (let i = 0; i < ORDER_COUNT; i += 1) {
      const items = makeOrderItems(products);
      ordersToInsert.push({
        customer: pick(customers)._id,
        order_date: randomDateInLastDays(180),
        items,
        total_amt: computeTotal(items),
        payment_mode: pick(paymentModes),
        status: 'Completed'
      });
    }

    // insertMany bypasses pre-save hooks, so we adjust stock manually below.
    const insertedOrders = await Order.insertMany(ordersToInsert);

    const stockDelta = new Map();
    for (const ord of ordersToInsert) {
      for (const it of ord.items) {
        const id = String(it.product);
        stockDelta.set(id, (stockDelta.get(id) || 0) - Math.abs(it.quantity));
      }
    }

    const productById = new Map(products.map((p) => [String(p._id), p]));

    const restocksToInsert = [];
    for (let i = 0; i < RESTOCK_COUNT; i += 1) {
      const p = pick(products);
      const qtyAdded = randInt(8, 55);
      restocksToInsert.push({
        product: p._id,
        supplier: p.supplier,
        date: randomDateInLastDays(120),
        qty_added: qtyAdded
      });
      const id = String(p._id);
      stockDelta.set(id, (stockDelta.get(id) || 0) + qtyAdded);
    }

    const insertedRestocks = await RestockLog.insertMany(restocksToInsert);

    const stockUpdates = [];
    for (const [productId, delta] of stockDelta.entries()) {
      const p = productById.get(productId);
      const adjusted = Math.max(0, (p?.stock_qty || 0) + delta);
      stockUpdates.push({
        updateOne: {
          filter: { _id: p._id },
          update: {
            $set: {
              stock_qty: adjusted,
              lowStockAlert: adjusted <= p.reorder_lvl
            }
          }
        }
      });
    }

    if (stockUpdates.length > 0) {
      await Product.bulkWrite(stockUpdates);
    }

    console.log('Large seed complete');
    console.log(`users=${2}`);
    console.log(`suppliers=${suppliers.length}`);
    console.log(`products=${products.length}`);
    console.log(`customers=${customers.length}`);
    console.log(`orders=${insertedOrders.length}`);
    console.log(`restocks=${insertedRestocks.length}`);
    console.log(`total_records=${2 + suppliers.length + products.length + customers.length + insertedOrders.length + insertedRestocks.length}`);

    process.exit(0);
  } catch (err) {
    console.error('Large seed error:', err);
    process.exit(1);
  }
}

run();
