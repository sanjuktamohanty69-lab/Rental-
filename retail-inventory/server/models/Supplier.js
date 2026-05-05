/**
 * Supplier model
 * Represents suppliers who provide products to the store.
 */
const mongoose = require('mongoose');
const { Schema } = mongoose;

const supplierSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    contact: { type: String },
    email: { type: String, lowercase: true, trim: true },
    city: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Supplier', supplierSchema);
