const express = require("express");
const userRoute = express.Router();
const User = require("../models/User");

const generateToken = require("../tokens/TokenGenerate");
const protect = require("./middleware/Auth");



//User Profile Route
userRoute.get("/profile", protect, async (req, res) => {
	const user = await User.findById(req.user._id);
	if (user) {
		res.status(200).json({
			_id: user._id,
			first_name: user.first_name,
			last_name: user.last_name,
			username: user.username,
			phone: user.phone,
			email: user.email,
			isAdmin: user.isAdmin,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		});
	} else {
		res.status(404).json({ error: "User not found" });
	}
});

//get user by id
userRoute.get("/:id", protect, async (req, res) => {
	const user = await User.findById(req.params.id).select("-password");
	if (user) {
		res.json(user);
	} else {
		res.status(404);
		throw new Error("User not found");
	}
});

//User Update Profile Route
userRoute.put("/profile", protect, async (req, res) => {
	const user = await User.findById(req.user._id);
	if (user) {
		user.first_name = req.body.first_name || user.first_name;
		user.last_name = req.body.last_name || user.last_name;
		user.email = req.body.email || user.email;
		user.username = req.body.username || user.username;
		user.phone = req.body.phone || user.phone;
		if (req.body.password) {
			user.password = req.body.password;
		}
		const updatedUser = await user.save();
		res.json({
			_id: updatedUser._id,
			first_name: updatedUser.first_name,
			last_name: updatedUser.last_name,
			username: updatedUser.username,
			phone: updatedUser.phone,
			email: updatedUser.email,
			isAdmin: updatedUser.isAdmin,
			createdAt: updatedUser.createdAt,
			updatedAt: updatedUser.updatedAt,
			token: generateToken(updatedUser._id),
		});
	} else {
		res.status(404);
		throw new error("User not found");
	}
});

//Get all users
userRoute.get("/", protect, async (req, res) => {
	const users = await User.find({});
	res.json(users);
});

//Delete user
userRoute.delete("/:id", protect, async (req, res) => {
	const user = await User.findById(req.params.id);
	if (user) {
		await user.remove();
		res.json({ message: "User removed" });
	} else {
		res.status(404);
		throw new Error("User not found");
	}
});

module.exports = userRoute;
