// models/ProductAttribute.js
const mongoose = require('mongoose');

const productAttributeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: ''
    },
    values: [
      {
        type: String
      }
    ]
  }
);

// Export the schema (not the model) since it will be embedded
module.exports = productAttributeSchema;