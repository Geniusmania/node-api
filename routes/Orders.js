const express = require("express");
const orderRouter = express.Router();
const Order = require("../models/Order");
 const protect = require("./middleware/Auth");
// const admin = require("../routes/middleware/Auth").admin;

//Create a new order
orderRouter.post("/", protect, async (req, res) => {
  try {
    const {
      address,
      deliveryDate,
      items,
      orderDate,
      paymentMethod,
      status,
      totalAmount
    } = req.body;

    // Validate required fields
    if (
      !address ||
      !deliveryDate ||
      !items ||
      !orderDate ||
      !paymentMethod ||
      !status ||
      !totalAmount
    ) {
      return res.status(400).json({ error: "Please fill all fields" });
    }

    // Validate items array
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Items cannot be empty" });
    }

    const order = new Order({
      address,
      deliveryDate,
      items,
      orderDate,
      paymentMethod,
      status,
      totalAmount,
      userId: req.user._id // User ID comes from the protect middleware
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all orders - Admin only route
orderRouter.get("/",protect, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "first_name last_name email")
      .populate("items.product");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Get specific order by ID
orderRouter.get("/:id",protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "first_name last_name email")
      .populate("items.product");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Ensure users can only access their own orders unless they're admin
    if (order.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: "Not authorized to access this order" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Delete an order
orderRouter.delete("/:id",protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Ensure users can only delete their own orders unless they're admin
    if (order.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: "Not authorized to delete this order" });
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Get orders for the currently logged-in user
orderRouter.get("/user",protect, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate("items.product")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Update order status (admin only)
orderRouter.put("/:id/status",protect, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    order.status = status;
    const updatedOrder = await order.save();
    
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Update order details (only if status is "pending")
orderRouter.put("/:id",protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    // Ensure users can only update their own orders
    if (order.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: "Not authorized to update this order" });
    }

    // Only allow updates if order is still pending
    if (order.status !== "pending" && !req.user.isAdmin) {
      return res.status(400).json({ error: "Order can only be modified while pending" });
    }

    const {
      address,
      deliveryDate,
      items,
      paymentMethod,
      totalAmount
    } = req.body;

    // Update fields if provided
    if (address) order.address = address;
    if (deliveryDate) order.deliveryDate = deliveryDate;
    if (items && items.length > 0) order.items = items;
    if (paymentMethod) order.paymentMethod = paymentMethod;
    if (totalAmount) order.totalAmount = totalAmount;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Get order statistics (admin only)
orderRouter.get("/stats/summary",protect, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    // Orders in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      totalOrders,
      ordersByStatus,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = orderRouter;