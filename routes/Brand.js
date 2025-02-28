// routes/brandRoutes.js
const express = require('express');
const brandRoute = express.Router();
const Brand = require('../models/Brand');
const { uploadBrandImage, deleteImage } = require('../utils/multer/multer');

// Get all brands
brandRoute.get('/', async (req, res) => {
  try {
    const brands = await Brand.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: brands.length,
      data: brands
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching brands',
      error: error.message
    });
  }
});

// Get featured brands
brandRoute.get('/featured', async (req, res) => {
  try {
    const brands = await Brand.find({ isFeatured: true }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: brands.length,
      data: brands
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching featured brands',
      error: error.message
    });
  }
});

// Get single brand by ID
brandRoute.get('/:id', async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }
    res.status(200).json({
      success: true,
      data: brand
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching brand',
      error: error.message
    });
  }
});

// Create new brand
brandRoute.post('/', uploadBrandImage.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Brand image is required'
      });
    }

    const newBrand = new Brand({
      name: req.body.name,
      image: req.file.path,
      isFeatured: req.body.isFeatured === 'true'
    });

    const savedBrand = await newBrand.save();
    res.status(201).json({
      success: true,
      data: savedBrand
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating brand',
      error: error.message
    });
  }
});

// Update brand
brandRoute.put('/:id', uploadBrandImage.single('image'), async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    // If new image is uploaded, delete the old one
    if (req.file) {
      await deleteImage(brand.image);
    }

    const updatedBrand = await Brand.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        image: req.file ? req.file.path : brand.image,
        isFeatured: req.body.isFeatured === 'true' || req.body.isFeatured === true
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedBrand
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating brand',
      error: error.message
    });
  }
});

// Delete brand
brandRoute.delete('/:id', async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    // Delete brand image from Cloudinary
    await deleteImage(brand.image);

    // Delete brand from database
    await Brand.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Brand deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting brand',
      error: error.message
    });
  }
});

module.exports = brandRoute;