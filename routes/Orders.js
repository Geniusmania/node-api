const express = require("express");
const protect = require("./middleware/Auth");
const Order = require("../models/Order");
const orderRoute = express.Router();

//  Create order
orderRoute.post("/", protect, async (req, res) => {
	const {
		orderItems,
		shippingAddress,
		paymentMethod,
		itemsPrice,
		taxPrice,
		shippingPrice,
		totalPrice,
	} = req.body;

	if (!orderItems || orderItems.length === 0) {
		return res.status(400).json({ message: "No order items" });
	}

	try {
		const order = new Order({
			orderItems,
			user: req.user._id,
			shippingAddress,
			paymentMethod,
			itemsPrice,
			taxPrice,
			shippingPrice,
			totalPrice,
		});

		const createdOrder = await order.save();
		res.status(201).json(createdOrder);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

//  Get all orders (should be before '/:id' route to avoid conflicts)

const admin = (req, res, next) => {
	if (req.user && req.user.isAdmin === "true") {
		next();
	} else {
		res.status(403).json({ message: "Access denied: Admins only" });
	}
};

orderRoute.get("/", protect, admin, async (req, res) => {
	try {
		const orders = await Order.find({ user: req.user._id }).sort({ _id: -1 });
		res.status(200).json(orders);
	} catch (error) {
		res.status(404).json({ message: error.message });
		throw new Error("Orders not found");
	}
});

//  Get orders by user
orderRoute.get("/", protect, async (req, res) => {
	try {
		const userId = req.user._id;
		const orders = await Order.find({ user: userId });
		res.json(orders);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Get order by ID
orderRoute.get("/:id", protect, async (req, res) => {
	try {
		const order = await Order.findById(req.params.id).populate("user", "email");
		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		} else {
			res.json(order);
		}
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

//  Update order to paid
orderRoute.put("/:id/pay", protect, async (req, res) => {
	try {
		const order = await Order.findById(req.params.id);
		if (!order) return res.status(404).json({ message: "Order not found" });

		order.isPaid = true;
		order.paidAt = Date.now();
		order.paymentResult = {
			id: req.body.id,
			status: req.body.status,
			update_time: req.body.update_time,
			email_address: req.body.email_address,
		};

		const updatedOrder = await order.save();
		res.status(200).json(updatedOrder);
	} catch (error) {
		res.status(404).json({ message: error.message });
	}
});

module.exports = orderRoute;
