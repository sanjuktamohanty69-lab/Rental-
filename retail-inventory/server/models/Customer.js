/**
 * Customer model
 * Represents a customer with contact information.
 */
const mongoose = require('mongoose');
const { Schema } = mongoose;

const customerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String },
    email: { type: String, lowercase: true, trim: true },
    address: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Customer', customerSchema);
