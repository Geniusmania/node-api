const express = require("express");
const addressRouter = express.Router();
const Address = require("../models/Address");
const User = require("../models/User");
const protect = require("./middleware/Auth");

// Get all addresses
addressRouter.get("/", async (req, res) => {
	try {
		const addresses = await Address.find({ user: req.user._id });
		res.statusCode(200).json(addresses);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Server error" });
	}
});

//post an address
addressRouter.post("/", async (req, res) => {
	try {
		const {
			name,
			city,
			postalCode,
			phoneNumber,
			isSelected,
			state,
			street,
			country,
		} = req.body;

		if (
			!name ||
			!city ||
			!postalCode ||
			!phoneNumber ||
			!state ||
			!street ||
			!country
		) {
			return res.status(400).json({ error: "Please fill all fields" });
		}
		const address = new Address({
			name,
			city,
			state,
			street,
			country,
			postalCode,
			phoneNumber,
			isSelected,
			user: req.user._id,
		});

		const newAddress = await address.save();
		res.status(201).json(newAddress);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});
addressRouter.put("/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const { selected } = req.body;

		// Validate input
		if (typeof selected !== "boolean") {
			return res.status(400).json({ message: "Invalid selected value" });
		}

		// Find and update the address
		const updatedAddress = await Address.findByIdAndUpdate(
			id,
			{ selected },
			{ new: true } // Returns the updated document
		);

		if (!updatedAddress) {
			return res.status(404).json({ message: "Address not found" });
		}

		res
			.status(200)
			.json({ message: "Address updated successfully", updatedAddress });
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

module.exports = addressRouter;
