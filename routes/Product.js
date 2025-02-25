const express = require("express");
const Product = require("../models/Product");
const productRoute = express.Router();

//all products
productRoute.get("/", async (req, res) => {
	const allproducts = await Product.find();
	res.status(200).json(allproducts);
});

//get product by id
productRoute.get("/:id", async (req, res) => {
	id = req.params.id;
	const product = await Product.findById(id);
	if (product) {
		res.status(200).json(product);
	} else {
		res.status(404).json({ message: "Product not found" });
	}
});

// add product
productRoute.post("/", async (req, res) => {
	const product = new Product({
		id: id,
		name: req.body.name,
		old_price: req.body.old_price,
		new_price: req.body.new_price,
		description: req.body.description,
		image: req.body.image,
		category: req.body.category,
	});
	try {
		await product.save();
		res.status(201).json(product);
	} catch (err) {
		res.status(400).json({ message: "Failed to add product" });
	}
});

//update product
productRoute.put("/:id", async (req, res) => {
	id = req.params.id;
	const product = await Product.findById(id);
	if (product) {
		product.name = req.body.name || product.name;
		product.price = req.body.price || product.price;
		product.description = req.body.description || product.description;
		product.image = req.body.image || product.image;
		product.stock = req.body.stock || product.stock;
		product.category = req.body.category || product.category;
		product.rating = req.body.rating || product.rating;
		try {
			await product.save();
			res.status(200).json(product);
		} catch (err) {
			res.status(400).json({ message: "Failed to update product" });
		}
	} else {
		res.status(404).json({ message: "Product not found" });
	}
});

module.exports = productRoute;
