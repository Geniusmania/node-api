const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
	{
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: true,
		},
		quantity: {
			type: Number,
			required: true,
			min: 1,
		},
		price: {
			type: Number,
			required: true,
		},
	},
	{ _id: false }
);
const orderSchema = new mongoose.Schema(
	{
		address: {
			type: String,
			required: true,
		},
		deliveryDate: {
			type: Date, // or Date
			required: true,
		},
		items: {
			type: [orderItemSchema],
			required: true,
		},
		orderDate: {
			type: Date, // or Date
			required: true,
		},
		paymentMethod: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			required: true,
		},
		totalAmount: {
			type: Number,
			required: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
