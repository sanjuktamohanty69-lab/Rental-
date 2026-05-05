/**
 * Order model
 * Stores customer orders, line items and computed totals.
 */
const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    unit_price: { type: Number, required: true }
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    order_date: { type: Date, default: Date.now },
    items: { type: [OrderItemSchema], default: [] },
    total_amt: { type: Number, default: 0 },
    payment_mode: { type: String, enum: ['Cash', 'Card', 'UPI', 'Online'], default: 'Cash' },
    status: { type: String, enum: ['Pending', 'Completed', 'Cancelled'], default: 'Completed' }
  },
  { timestamps: true }
);

// Pre-save: calculate total_amt and decrement product stock when creating a new order
orderSchema.pre('save', async function (next) {
  try {
    // Calculate total
    this.total_amt = this.items.reduce((sum, it) => sum + (it.quantity * it.unit_price), 0);

    // If new order, decrement product stock quantities
    if (this.isNew) {
      const Product = mongoose.model('Product');
      for (const item of this.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock_qty: -Math.abs(item.quantity) } });
      }
    }

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Order', orderSchema);
