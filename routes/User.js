const express = require("express");
const userRoute = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../tokens/TokenGenerate");
const protect = require("./middleware/Auth");
//User login Route
userRoute.post("/login", async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email });
	try {
		if (user && (await user.matchPassword(password))) {
			res.json({
				_id: user._id,
				name: user.name,
				email: user.email,
				isAdmin: user.isAdmin,
				token: generateToken(user._id),
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			});
		}
	} catch (error) {
		res.status(401).json({ error: error.message });
	}
});

//User Register Route
userRoute.post("/register", async (req, res) => {
	const { name, email, password } = req.body;
	const userExists = await User.findOne({
		email,
	});

	try {
		if (userExists) {
			res.status(400).json({ error: "User already exists" });
		} else {
			const user = await User.create({
				name,
				email,
				password,
			});
			if (user) {
				res.status(201).json({
					_id: user._id,
					name: user.name,
					email: user.email,
					isAdmin: user.isAdmin,
					token: null,
					createdAt: user.createdAt,
					updatedAt: user.updatedAt,
				});
			}
		}
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

//User Profile Route
userRoute.get("/profile", protect, async (req, res) => {
	const user = await User.findById(req.user._id);
	if (user) {
		res.status(200).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			isAdmin: user.isAdmin,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		});
	} else {
		res.status(404).json({ error: "User not found" });
	}
});

//User Update Profile Route
userRoute.put("/profile", protect, async (req, res) => {
	const user = await User.findById(req.user._id);
	if (user) {
		user.name = req.body.name || user.name;
		user.email = req.body.email || user.email;
		if (req.body.password) {
			user.password = req.body.password;
		}
		const updatedUser = await user.save();
		res.json({
			_id: updatedUser._id,
			name: updatedUser.name,
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
