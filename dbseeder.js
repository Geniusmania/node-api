const express = require("express");
const router = express.Router();

const User = require("./models/User");
const users = require("./data/Users");
const Products = require("./data/Products");
const Product = require("./models/Product");

router.post("/users", async (req, res) => {
	await User.deleteMany({});
	const UserSeeder = await User.insertMany(users);
	res.send({ UserSeeder });
});

router.post("/products", async (req, res) => {
	await Product.deleteMany({});
	const ProductSeeder = await Product.insertMany(Products);
	res.send({ ProductSeeder });
});

module.exports = router;
