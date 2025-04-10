const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title: String,
  price: Number,
  image: String,
  quantity: Number,
  variationId: String,
  brandName: String,
  selectedVariations: {
    type: Map,
    of: String
  },
});

const orderSchema = new mongoose.Schema({
  address: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
  deliveryDate: { type: Date },
  items: [cartItemSchema],
  orderDate: { type: Date, default: Date.now },
  paymentMethod: { type: String, required: true },
  status: {
    type: String,
    enum: ['processing', 'shipped', 'delivered'],
    default: 'processing',
  },
  totalAmount: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
