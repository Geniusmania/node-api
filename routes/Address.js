const express = require("express");
const addressRouter = express.Router();
const Address = require("../models/Address");
const protect = require("./middleware/Auth");

// Get all addresses for logged-in user
addressRouter.get("/", protect, async (req, res) => {
	try {
		const addresses = await Address.find({ user: req.user.id });
		res.status(200).json(addresses);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Server error" });
	}
});

// Add a new address
addressRouter.post("/", protect, async (req, res) => {
	try {
		const {
			name, city, postalCode, phoneNumber,
			isSelected, state, street, country
		} = req.body;

		if (!name || !city || !postalCode || !phoneNumber || !state || !street || !country) {
			return res.status(400).json({ error: "Please fill all fields" });
		}

		const address = new Address({
			name, city, state, street, country,
			postalCode, phoneNumber, isSelected,
			user: req.user.id, // User from Auth Middleware
		});

		const newAddress = await address.save();
		res.status(201).json(newAddress);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Update address selection
addressRouter.put("/:id", protect, async (req, res) => {
	try {
		const { id } = req.params;
		const { isSelected } = req.body;

		if (typeof isSelected !== "boolean") {
			return res.status(400).json({ message: "Invalid isSelected value" });
		}

		const updatedAddress = await Address.findByIdAndUpdate(
			id,
			{ isSelected },
			{ new: true }
		);

		if (!updatedAddress) {
			return res.status(404).json({ message: "Address not found" });
		}

		res.status(200).json({ message: "Address updated successfully", updatedAddress });
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

module.exports = addressRouter;
