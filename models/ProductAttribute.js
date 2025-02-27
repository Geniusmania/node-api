// models/ProductAttribute.js
const mongoose = require('mongoose');

const productAttributeSchema = new mongoose.Schema(
  {
    name: {type: String,default: ''},
    values: [{type: String}]
  }
);


module.exports = productAttributeSchema;