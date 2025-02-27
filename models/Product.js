// models/Product.js
const mongoose = require('mongoose');
const productAttributeSchema = require('./ProductAttribute');
const productVariationSchema = require('./productVariation');

const productSchema = new mongoose.Schema(
  {
    stock: {type: Number,required: true,},
    sku: {type: String,trim: true },
    price: {type: Number,required: true},
    title: {type: String,required: true,trim: true},
    date: {type: Date,default: Date.now},
    salePrice: {type: Number,required: true},
    thumbnail: {type: String,required: true},
    isFeatured: {type: Boolean,default: true},
    brand: {type: mongoose.Schema.Types.ObjectId,ref: 'Brand'},
    description: {type: String},
    images: [{type: String}],
    categoryId: {type: String,trim:true},
    productType: {type: String,required: true,trim: true},
    productAttributes: [productAttributeSchema],
    productVariations: [productVariationSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);