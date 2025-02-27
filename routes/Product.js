const express = require('express');
const productRoute = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const Brand = require('../models/Brand');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });

// Helper function to delete images
const deleteImage = (imagePath) => {
  const fullPath = path.join(__dirname, '../uploads', imagePath);
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
};

//  Check if SKU already exists
const checkSKUExists = async (sku) => {
  const existingProduct = await Product.findOne({ sku });
  return !!existingProduct;
};

//  Create a new product
productRoute.post('/', upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'images', maxCount: 10 }]), async (req, res) => {
  try {
    const { title, price, salePrice, description, brand, categoryId, productType, productAttributes, productVariations, sku, stock } = req.body;

    // Check for required fields
    if (!title || !price || !salePrice || !productType || !stock) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check for thumbnail
    if (!req.files['thumbnail']) {
      return res.status(400).json({ message: 'Thumbnail is required' });
    }

    // Check for duplicate SKU
    if (sku && await checkSKUExists(sku)) {
      return res.status(400).json({ message: 'SKU already exists' });
    }

    // Parse productAttributes and productVariations
    let parsedAttributes = [];
    let parsedVariations = [];

    try {
      parsedAttributes = JSON.parse(productAttributes || '[]');
      parsedVariations = JSON.parse(productVariations || '[]');
    } catch (error) {
      return res.status(400).json({ message: "Invalid JSON in productAttributes or productVariations" });
    }

    // Create the product
    const product = new Product({
      title,
      price,
      salePrice,
      description,
      brand,
      categoryId,
      productType,
      stock,
      sku,
      productAttributes: parsedAttributes,
      productVariations: parsedVariations,
      thumbnail: req.files['thumbnail'][0].filename,
      images: req.files['images'] ? req.files['images'].map(file => file.filename) : []
    });

    await product.save();

    // Increase brand's product count
    if (brand) {
      await Brand.findByIdAndUpdate(brand, { $inc: { productsCount: 1 } });
    }

    res.status(201).json({ message: 'Product added successfully', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Get all products
productRoute.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate('brand');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single product
productRoute.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('brand');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a product
productRoute.put('/:id', upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'images', maxCount: 10 }]), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { title, price, salePrice, description, brand, categoryId, productType, productAttributes, productVariations, sku, stock } = req.body;

    // Check for duplicate SKU (excluding the current product)
    if (sku && sku !== product.sku && await checkSKUExists(sku)) return res.status(400).json({ message: 'SKU already exists' });

    // Handle thumbnail update
    if (req.files['thumbnail']) {
      deleteImage(product.thumbnail);
      product.thumbnail = req.files['thumbnail'][0].filename;
    }

    // Handle images update
    if (req.files['images']) {
      product.images.forEach(deleteImage);
      product.images = req.files['images'].map(file => file.filename);
    }

    //  Update brand's product count if brand changed
    if (brand && brand !== product.brand) {
      await Brand.findByIdAndUpdate(product.brand, { $inc: { productsCount: -1 } }); // Decrease old brand count
      await Brand.findByIdAndUpdate(brand, { $inc: { productsCount: 1 } }); // Increase new brand count
    }

    Object.assign(product, {
      title, price, salePrice, description, brand, categoryId, productType, stock, sku,
      productAttributes: JSON.parse(productAttributes || '[]'),
      productVariations: JSON.parse(productVariations || '[]')
    });

    await product.save();
    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//  Delete a product
productRoute.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Delete associated images
    deleteImage(product.thumbnail);
    product.images.forEach(deleteImage);

    //  Decrease brand's product count
    if (product.brand) await Brand.findByIdAndUpdate(product.brand, { $inc: { productsCount: -1 } });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = productRoute;




// {
//   "_id": "67c070411861a069a96b65e4",
//   "stock": 100,
//   "sku": "sample-sku-123",
//   "price": 99.9,
//   "title": "Sample product",
//   "salePrice": 89.9,
//   "thumbnail": "1740664897826-asiucb.JPG",
//   "isFeatured": true,
//   "brand": {
//       "_id": "67c055304aae473c8f732954",
//       "name": "Nike",
//       "image": "http://localhost:3000/uploads/brands/image_1740657968532.JPG",
//       "isFeatured": true,
//       "productsCount": 1,
//       "createdAt": "2025-02-27T12:06:08.668Z",
//       "updatedAt": "2025-02-27T14:01:38.186Z",
//       "__v": 0
//   },
//   "description": "this is sample description",
//   "images": [
//       "1740664897828-GoDaddy.JPG",
//       "1740664897831-media.JPG",
//       "1740664897834-memo.JPG"
//   ],
//   "categoryId": "electronics",
//   "productType": "physical",
//   "productAttributes": [
//       {
//           "name": "color",
//           "values": [
//               "red",
//               "blue"
//           ],
//           "_id": "67c070411861a069a96b65e5"
//       }
//   ],
//   "productVariations": [
//       {
//           "sku": "var1",
//           "image": "image1.jpg",
//           "price": 99.99,
//           "salePrice": 89.99,
//           "stock": 10,
//           "attributeValues": {
//               "color": "red"
//           },
//           "_id": "67c070411861a069a96b65e6"
//       }
//   ],
//   "date": "2025-02-27T14:01:37.981Z",
//   "createdAt": "2025-02-27T14:01:37.989Z",
//   "updatedAt": "2025-02-27T14:01:37.989Z",
//   "__v": 0
// }