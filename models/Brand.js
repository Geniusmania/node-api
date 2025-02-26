// models/Brand.js
const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    productsCount: {
      type: Number
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Brand', brandSchema);