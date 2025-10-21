const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 0 },
  reorderLevel: { type: Number, required: true, default: 10 },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  lastRestocked: { type: Date, default: Date.now },
  imageUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);