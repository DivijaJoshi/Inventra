const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true },
  address: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, default: 3 },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  lastSupplied: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);