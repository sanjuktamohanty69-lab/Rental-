/**
 * RestockLog model
 * Records restocking events for products from suppliers.
 */
const mongoose = require('mongoose');
const { Schema } = mongoose;

const restockLogSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    date: { type: Date, default: Date.now },
    qty_added: { type: Number, required: true, min: 1 }
  },
  { timestamps: true }
);

// After saving a restock, increment the product stock by qty_added
restockLogSchema.post('save', async function (doc, next) {
  try {
    const Product = mongoose.model('Product');
    await Product.findByIdAndUpdate(doc.product, { $inc: { stock_qty: Math.abs(doc.qty_added) } });
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('RestockLog', restockLogSchema);
