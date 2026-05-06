# MongoDB Queries Used in This Project

This file lists common MongoDB queries used for the RetailIQ (retail-inventory) project, their syntax, and where to run them.

## Where to Run These Queries
- MongoDB Atlas: Data Explorer -> your database -> collections -> filter/pipeline
- MongoDB Compass: Open the collection and use the Filter/Project/Sort/Limit boxes or Aggregations tab
- `mongosh`: command-line shell

## Collections in This Project
These are the default collection names created by Mongoose:
- `users`
- `suppliers`
- `products`
- `customers`
- `orders`
- `restocklogs`

Field highlights:
- `products`: `name`, `category`, `price`, `stock_qty`, `reorder_lvl`, `supplier`, `lowStockAlert`
- `customers`: `name`, `email`, `phone`, `address`
- `orders`: `customer`, `order_date`, `items[]`, `total_amt`, `payment_mode`, `status`
- `orders.items[]`: `product`, `quantity`, `unit_price`
- `suppliers`: `name`, `contact`, `email`, `city`
- `restocklogs`: `product`, `supplier`, `date`, `qty_added`

---

## Basic Read Queries (find)

### List products (limit 10)
```js
db.products.find().limit(10)
```

### Projection (only name and price)
```js
db.products.find({}, { name: 1, price: 1, _id: 0 })
```

### Filter by category
```js
db.products.find({ category: "Electronics" })
```

### Range filter (stock between 1 and 10)
```js
db.products.find({ stock_qty: { $gte: 1, $lte: 10 } })
```

### Regex search (name contains "wire")
```js
db.products.find({ name: { $regex: "wire", $options: "i" } })
```

### Find orders by date range
```js
db.orders.find({
  order_date: { $gte: ISODate("2026-01-01"), $lte: ISODate("2026-12-31") }
})
```

---

## Sort, Skip, Limit (Pagination)

### Latest orders
```js
db.orders.find().sort({ order_date: -1 }).limit(20)
```

### Page 2 with page size 20
```js
db.orders.find().sort({ order_date: -1 }).skip(20).limit(20)
```

---

## Insert Queries

### Insert a product
```js
db.products.insertOne({
  name: "Desk Lamp",
  category: "Home",
  price: 24.99,
  stock_qty: 50,
  reorder_lvl: 10,
  lowStockAlert: false
})
```

### Insert a customer
```js
db.customers.insertOne({
  name: "Ava Patel",
  email: "ava.patel@example.com",
  phone: "555-7777",
  address: "42 Market Street"
})
```

---

## Update Queries

### Increase stock when restocking
```js
db.products.updateOne(
  { _id: ObjectId("PRODUCT_ID") },
  { $inc: { stock_qty: 25 } }
)
```

### Mark low stock alert
```js
db.products.updateMany(
  { stock_qty: { $lte: 10 } },
  { $set: { lowStockAlert: true } }
)
```

### Update customer email
```js
db.customers.updateOne(
  { _id: ObjectId("CUSTOMER_ID") },
  { $set: { email: "new.email@example.com" } }
)
```

### Upsert (update or insert)
```js
db.suppliers.updateOne(
  { email: "supplier99@demo.com" },
  { $set: { name: "Supplier 99", city: "Pune" } },
  { upsert: true }
)
```

---

## Delete Queries

### Delete one order
```js
db.orders.deleteOne({ _id: ObjectId("ORDER_ID") })
```

### Delete all cancelled orders
```js
db.orders.deleteMany({ status: "Cancelled" })
```

---

## Aggregation Pipelines (Reports)

### Sales summary (total sales + order count)
```js
db.orders.aggregate([
  { $unwind: "$items" },
  { $group: {
      _id: null,
      totalSales: { $sum: { $multiply: ["$items.quantity", "$items.unit_price"] } },
      orderCount: { $addToSet: "$_id" }
  } },
  { $project: {
      _id: 0,
      totalSales: 1,
      orders: { $size: "$orderCount" }
  } }
])
```

### Top products by quantity sold
```js
db.orders.aggregate([
  { $unwind: "$items" },
  { $group: {
      _id: "$items.product",
      qtySold: { $sum: "$items.quantity" },
      revenue: { $sum: { $multiply: ["$items.quantity", "$items.unit_price"] } }
  } },
  { $sort: { qtySold: -1 } },
  { $limit: 10 },
  { $lookup: {
      from: "products",
      localField: "_id",
      foreignField: "_id",
      as: "product"
  } },
  { $unwind: "$product" },
  { $project: { _id: 0, name: "$product.name", qtySold: 1, revenue: 1 } }
])
```

### Inventory status (low stock)
```js
db.products.aggregate([
  { $project: {
      name: 1,
      stock_qty: 1,
      reorder_lvl: 1,
      isLow: { $lte: ["$stock_qty", "$reorder_lvl"] }
  } },
  { $match: { isLow: true } },
  { $sort: { stock_qty: 1 } }
])
```

### Customer spending (lifetime value)
```js
db.orders.aggregate([
  { $group: {
      _id: "$customer",
      totalSpent: { $sum: "$total_amt" },
      orderCount: { $sum: 1 }
  } },
  { $sort: { totalSpent: -1 } },
  { $limit: 10 },
  { $lookup: {
      from: "customers",
      localField: "_id",
      foreignField: "_id",
      as: "customer"
  } },
  { $unwind: "$customer" },
  { $project: { _id: 0, name: "$customer.name", totalSpent: 1, orderCount: 1 } }
])
```

### Supplier restock totals
```js
db.restocklogs.aggregate([
  { $group: {
      _id: "$supplier",
      totalQty: { $sum: "$qty_added" },
      restockCount: { $sum: 1 }
  } },
  { $lookup: {
      from: "suppliers",
      localField: "_id",
      foreignField: "_id",
      as: "supplier"
  } },
  { $unwind: "$supplier" },
  { $project: { _id: 0, name: "$supplier.name", totalQty: 1, restockCount: 1 } }
])
```

---

## Indexes (Recommended)
Use these to speed up common queries. Run in `mongosh` or Atlas:

```js
db.products.createIndex({ category: 1 })
db.products.createIndex({ stock_qty: 1 })
db.customers.createIndex({ email: 1 }, { unique: true })
db.orders.createIndex({ order_date: -1 })
db.orders.createIndex({ customer: 1, order_date: -1 })
```

---

## Where These Queries Are Used in the App
- **Reports page**: aggregation pipelines (sales summary, top products, inventory status)
- **Orders page**: `find` + `sort` + `limit` for listing, `insert` when creating orders
- **Inventory/Restock**: `update` (`$inc`) to adjust `stock_qty`
- **Customers/Suppliers**: `find`, `insert`, `update`

---

## Quick Reference (Common Operators)
- Comparison: `$gt`, `$gte`, `$lt`, `$lte`, `$eq`, `$ne`
- Lists: `$in`, `$nin`
- Logical: `$and`, `$or`
- String: `$regex`
- Aggregation: `$match`, `$group`, `$project`, `$lookup`, `$unwind`, `$sort`, `$limit`

---

If you want, I can also add a short section with the exact Mongoose equivalents used in the Node.js controllers.
