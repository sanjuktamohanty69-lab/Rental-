/**
 * Product model
 * Represents an item sold by the store with pricing and stock information.
 */
const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock_qty: { type: Number, default: 0, min: 0 },
    reorder_lvl: { type: Number, default: 10 },
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    lowStockAlert: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Virtual: isLowStock
productSchema.virtual('isLowStock').get(function () {
  return this.stock_qty <= this.reorder_lvl;
});

// Pre-save hook: set lowStockAlert if stock_qty goes below reorder_lvl
productSchema.pre('save', function (next) {
  if (this.isModified('stock_qty') && this.stock_qty <= this.reorder_lvl) {
    this.lowStockAlert = true;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
