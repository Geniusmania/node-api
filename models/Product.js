const mongoose = require('mongoose');
// const reviewSchema = new mongoose.Schema({
//     user: {type: mongoose.Schema.Types.ObjectId,ref: 'User',required: true},
//     productId: {type: mongoose.Schema.Types.ObjectId,ref: 'Product',required: true},
//     rating: {type: Number,required: true,min: 1,max: 5},
//     comment: {type: String,trim: true}
//   }, { timestamps: true });


const productSchema = new mongoose.Schema({
  name: {type: String,required: true,trim: true},
  description: {type: String,trim: true},
  price: {type: Number,required: true,min: 0},
  category: {type: String,required: true},
  stock: {type: Number,required: true, min: 0},
  rating: {type: Number,min: 0,max: 5,default: 0},
 // countInStore: {type: Number,min: 0,max: 5,default: 0},
 // reviews: [reviewSchema]
});



module.exports = mongoose.model("Product", productSchema);
