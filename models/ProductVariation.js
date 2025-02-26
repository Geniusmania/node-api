// models/ProductVariation.js
const mongoose = require('mongoose');

const productVariationSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    price: {
      type: Number,
      required: true
    },
    salePrice: {
      type: Number,
      required: true
    },
    stock: {
      type: Number,
      required: true
    },
    attributeValues: {
      type: Map,
      of: String,
      default: {}
    }
  }
);

// Export the schema (not the model) since it will be embedded
module.exports = productVariationSchema;