const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  address: {
    name: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    street: { type: String, required: true },
    postalCode: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    country: { type: String, required: true },
  },
  deliveryDate: {
    type: Date,
    default: null,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      name: String,
      quantity: Number,
      price: Number,
      image: String,
    }
  ],
  orderDate: {
    type: Date,
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['processing', 'shipped', 'delivered'],
    default: 'processing',
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
});

module.exports = mongoose.model('Order', orderSchema);
