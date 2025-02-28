// routes/productRoutes.js
const express = require("express");
const productRoute = express.Router();
const Product = require("../models/Product");
const Brand = require("../models/Brand");
const { uploadProductImage, deleteImage } = require("../utils/multer/multer");

// Configure multiple image upload
const uploadMultipleImages = uploadProductImage.fields([
	{ name: "thumbnail", maxCount: 1 },
	{ name: "images", maxCount: 10 },
	{ name: "variationImages", maxCount: 20 },
]);

// Get all products with pagination
productRoute.get("/", async (req, res) => {
	try {
		//const page = parseInt(req.query.page) || 1;
		//const limit = parseInt(req.query.limit) || 10;
		///const skip = (page - 1) * limit;

		const filter = {};

		// Apply filters if provided
		if (req.query.brandId) filter.brand = req.query.brandId;
		if (req.query.categoryId) filter.categoryId = req.query.categoryId;
		if (req.query.featured) filter.isFeatured = req.query.featured === "true";

		const products = await Product.find(filter)
			.populate("brand", "name image")
			.sort({ createdAt: -1 });

		//const totalProducts = await Product.countDocuments(filter);

		res.status(200).json(products);
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error fetching products",
			error: error.message,
		});
	}
});

// Get featured products
productRoute.get("/featured", async (req, res) => {
	try {
		const limit = parseInt(req.query.limit) || 10;

		const products = await Product.find({ isFeatured: true })
			.populate("brand", "name image")
			.sort({ createdAt: -1 })
			.limit(limit);

		res.status(200).json({
			success: true,
			count: products.length,
			data: products,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error fetching featured products",
			error: error.message,
		});
	}
});

// Get products by brand
productRoute.get("/brand/:brandId", async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;

		const products = await Product.find({ brand: req.params.brandId })
			.populate("brand", "name image")
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);

		const totalProducts = await Product.countDocuments({
			brand: req.params.brandId,
		});

		res.status(200).json({
			success: true,
			count: products.length,
			total: totalProducts,
			pages: Math.ceil(totalProducts / limit),
			currentPage: page,
			data: products,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error fetching products by brand",
			error: error.message,
		});
	}
});

// Get products by category
productRoute.get("/category/:categoryId", async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;

		const products = await Product.find({ categoryId: req.params.categoryId })
			.populate("brand", "name image")
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);

		const totalProducts = await Product.countDocuments({
			categoryId: req.params.categoryId,
		});

		res.status(200).json({
			success: true,
			count: products.length,
			total: totalProducts,
			pages: Math.ceil(totalProducts / limit),
			currentPage: page,
			data: products,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error fetching products by category",
			error: error.message,
		});
	}
});

// Get single product by ID
productRoute.get("/:id", async (req, res) => {
	try {
		const product = await Product.findById(req.params.id).populate(
			"brand",
			"name image"
		);
		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found",
			});
		}

		res.status(200).json({
			success: true,
			data: product,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error fetching product",
			error: error.message,
		});
	}
});

// Create new product
productRoute.post("/", uploadMultipleImages, async (req, res) => {
	try {
		if (!req.files || !req.files.thumbnail) {
			return res.status(400).json({
				success: false,
				message: "Product thumbnail is required",
			});
		}

		// Parse the request body
		const productData = JSON.parse(req.body.productData || "{}");

		// Check if brand exists
		if (productData.brand) {
			const brandExists = await Brand.findById(productData.brand);
			if (!brandExists) {
				return res.status(404).json({
					success: false,
					message: "Brand not found",
				});
			}
		}

		// Prepare images array
		const imagesArray = req.files.images
			? req.files.images.map((file) => file.path)
			: [];

		// Process variations if any
		let variations = [];
		if (
			productData.productVariations &&
			Array.isArray(productData.productVariations)
		) {
			variations = productData.productVariations.map((variation, index) => {
				// If variation image is provided in the request, use it
				if (req.files.variationImages && req.files.variationImages[index]) {
					variation.image = req.files.variationImages[index].path;
				}

				// Convert attributeValues from array to Map if needed
				if (Array.isArray(variation.attributeValues)) {
					variation.attributeValues = variation.attributeValues.reduce(
						(map, attr) => {
							map[attr.key] = attr.value;
							return map;
						},
						{}
					);
				}

				return variation;
			});
		}

		// Create new product
		const newProduct = new Product({
			title: productData.title,
			description: productData.description,
			price: productData.price,
			salePrice: productData.salePrice,
			stock: productData.stock,
			sku: productData.sku,
			brand: productData.brand,
			thumbnail: req.files.thumbnail[0].path,
			images: imagesArray,
			categoryId: productData.categoryId,
			productType: productData.productType,
			isFeatured: productData.isFeatured,
			productAttributes: productData.productAttributes || [],
			productVariations: variations,
		});

		const savedProduct = await newProduct.save();

		// Update product count for the brand
		if (productData.brand) {
			await Brand.findByIdAndUpdate(productData.brand, {
				$inc: { productsCount: 1 },
			});
		}

		res.status(201).json({
			success: true,
			data: savedProduct,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error creating product",
			error: error.message,
		});
	}
});

// Update product
productRoute.put("/:id", uploadMultipleImages, async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);
		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found",
			});
		}

		// Parse the request body
		const productData = JSON.parse(req.body.productData || "{}");

		// Check if brand changed
		let oldBrandId = null;
		if (
			productData.brand &&
			product.brand &&
			productData.brand !== product.brand.toString()
		) {
			oldBrandId = product.brand;
		}

		// Prepare images to update
		let thumbnailToUpdate = product.thumbnail;
		if (req.files && req.files.thumbnail) {
			// Delete old thumbnail
			await deleteImage(product.thumbnail);
			thumbnailToUpdate = req.files.thumbnail[0].path;
		}

		// Update or keep existing images
		let imagesToUpdate = [...product.images];
		if (req.files && req.files.images && req.files.images.length > 0) {
			// Delete old images if specified
			if (productData.deleteAllImages) {
				for (const img of product.images) {
					await deleteImage(img);
				}
				imagesToUpdate = req.files.images.map((file) => file.path);
			} else {
				// Append new images
				imagesToUpdate = [
					...imagesToUpdate,
					...req.files.images.map((file) => file.path),
				];
			}
		}

		// Process variations if any
		let variationsToUpdate = [...product.productVariations];
		if (
			productData.productVariations &&
			Array.isArray(productData.productVariations)
		) {
			if (productData.replaceAllVariations) {
				// Delete old variation images
				for (const variation of product.productVariations) {
					if (variation.image) {
						await deleteImage(variation.image);
					}
				}

				variationsToUpdate = productData.productVariations.map(
					(variation, index) => {
						// If variation image is provided in the request, use it
						if (req.files.variationImages && req.files.variationImages[index]) {
							variation.image = req.files.variationImages[index].path;
						}

						// Convert attributeValues from array to Map if needed
						if (Array.isArray(variation.attributeValues)) {
							variation.attributeValues = variation.attributeValues.reduce(
								(map, attr) => {
									map[attr.key] = attr.value;
									return map;
								},
								{}
							);
						}

						return variation;
					}
				);
			} else {
				// Update only specified variations
				variationsToUpdate = productData.productVariations.map((variation) => {
					const existingVariation = product.productVariations.find(
						(v) => v._id.toString() === variation._id
					);

					if (existingVariation) {
						// Update existing variation
						if (
							req.files.variationImages &&
							variation.imageIndex !== undefined
						) {
							// Delete old image if exists
							if (existingVariation.image) {
								deleteImage(existingVariation.image);
							}
							// Set new image
							variation.image =
								req.files.variationImages[variation.imageIndex].path;
						} else {
							// Keep existing image
							variation.image = existingVariation.image;
						}
					}

					// Convert attributeValues from array to Map if needed
					if (Array.isArray(variation.attributeValues)) {
						variation.attributeValues = variation.attributeValues.reduce(
							(map, attr) => {
								map[attr.key] = attr.value;
								return map;
							},
							{}
						);
					}

					return variation;
				});
			}
		}

		// Update product
		const updatedProduct = await Product.findByIdAndUpdate(
			req.params.id,
			{
				title: productData.title || product.title,
				description: productData.description || product.description,
				price: productData.price || product.price,
				salePrice: productData.salePrice || product.salePrice,
				stock:
					productData.stock !== undefined ? productData.stock : product.stock,
				sku: productData.sku || product.sku,
				brand: productData.brand || product.brand,
				thumbnail: thumbnailToUpdate,
				images: imagesToUpdate,
				categoryId: productData.categoryId || product.categoryId,
				productType: productData.productType || product.productType,
				isFeatured:
					productData.isFeatured !== undefined
						? productData.isFeatured
						: product.isFeatured,
				productAttributes:
					productData.productAttributes || product.productAttributes,
				productVariations: variationsToUpdate,
			},
			{ new: true }
		);

		// Update brand product counts if brand changed
		if (oldBrandId) {
			// Decrement old brand product count
			await Brand.findByIdAndUpdate(oldBrandId, {
				$inc: { productsCount: -1 },
			});

			// Increment new brand product count
			await Brand.findByIdAndUpdate(productData.brand, {
				$inc: { productsCount: 1 },
			});
		}

		res.status(200).json({
			success: true,
			data: updatedProduct,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error updating product",
			error: error.message,
		});
	}
});

// Delete product
productRoute.delete("/:id", async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);
		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found",
			});
		}

		// Delete thumbnail
		await deleteImage(product.thumbnail);

		// Delete all product images
		for (const image of product.images) {
			await deleteImage(image);
		}

		// Delete all variation images
		for (const variation of product.productVariations) {
			if (variation.image) {
				await deleteImage(variation.image);
			}
		}

		// Update brand product count
		if (product.brand) {
			await Brand.findByIdAndUpdate(product.brand, {
				$inc: { productsCount: -1 },
			});
		}

		// Delete product from database
		await Product.findByIdAndDelete(req.params.id);

		res.status(200).json({
			success: true,
			message: "Product deleted successfully",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error deleting product",
			error: error.message,
		});
	}
});

// Batch delete products
productRoute.post("/batch-delete", async (req, res) => {
	try {
		const { ids } = req.body;

		if (!ids || !Array.isArray(ids) || ids.length === 0) {
			return res.status(400).json({
				success: false,
				message: "Product IDs are required",
			});
		}

		// Get all products to delete
		const products = await Product.find({ _id: { $in: ids } });

		// Delete all images and update brand counts
		const brandProductCounts = {};

		for (const product of products) {
			// Delete thumbnail
			await deleteImage(product.thumbnail);

			// Delete all product images
			for (const image of product.images) {
				await deleteImage(image);
			}

			// Delete all variation images
			for (const variation of product.productVariations) {
				if (variation.image) {
					await deleteImage(variation.image);
				}
			}

			// Track brand product counts
			if (product.brand) {
				const brandId = product.brand.toString();
				brandProductCounts[brandId] = (brandProductCounts[brandId] || 0) + 1;
			}
		}

		// Update brand product counts
		for (const [brandId, count] of Object.entries(brandProductCounts)) {
			await Brand.findByIdAndUpdate(brandId, {
				$inc: { productsCount: -count },
			});
		}

		// Delete products from database
		await Product.deleteMany({ _id: { $in: ids } });

		res.status(200).json({
			success: true,
			message: `${products.length} products deleted successfully`,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error batch deleting products",
			error: error.message,
		});
	}
});

module.exports = productRoute;





// {
//   "title": "Ultra HD Smart TV",
//   "description": "55-inch 4K Ultra HD Smart TV with HDR and Dolby Vision.",
//   "price": 1200,
//   "salePrice": 999,
//   "stock": 30,
//   "sku": "UHDTV55",
//   "brand": "60d21b4667d0d8992e610c99",
//   "categoryId": "home-appliances",
//   "productType": "physical",
//   "isFeatured": true,
//   "productAttributes": [
//     {
//       "name": "Screen Size",
//       "values": ["50-inch", "55-inch", "65-inch"]
//     },
//     {
//       "name": "Resolution",
//       "values": ["4K", "8K"]
//     }
//   ],
//   "productVariations": [
//     {
//       "sku": "UHDTV55-50INCH-4K",
//       "price": 1200,
//       "salePrice": 999,
//       "stock": 15,
//       "attributeValues": {
//         "Screen Size": "50-inch",
//         "Resolution": "4K"
//       }
//     }
//   ]
// }
