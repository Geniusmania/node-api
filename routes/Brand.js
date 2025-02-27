const express = require('express');
const brandRoute = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Brand = require('../models/Brand');

// Set up storage for brand uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const brandDir = path.join(__dirname, '../uploads/brands');
    if (!fs.existsSync(brandDir)) {
      fs.mkdirSync(brandDir, { recursive: true });
    }
    cb(null, brandDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// Add a new brand with name uniqueness check
brandRoute.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, isFeatured } = req.body;

    // Check if a brand with the same name already exists
    const existingBrand = await Brand.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingBrand) {
      return res.status(400).json({ message: 'Brand name already exists' });
    }

    const image = `${req.protocol}://${req.get('host')}/uploads/brands/${req.file.filename}`;

    const brand = new Brand({ name, image, isFeatured: isFeatured === 'true' });
    await brand.save();

    res.status(201).json({ message: 'Brand added successfully', brand });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all brands
brandRoute.get('/', async (req, res) => {
  try {
    const brands = await Brand.find();
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single brand
brandRoute.get('/:id', async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a brand (also checks for duplicate name)
brandRoute.put('/updatebrand/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, isFeatured } = req.body;
    const updatedData = { name, isFeatured: isFeatured === 'true' };

    if (req.file) {
      updatedData.imageUrl = `${req.protocol}://${req.get('host')}/uploads/brands/${req.file.filename}`;
    }

    // Check for duplicate name, but exclude the current brand being updated
    const existingBrand = await Brand.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }, 
      _id: { $ne: req.params.id } 
    });

    if (existingBrand) {
      return res.status(400).json({ message: 'Brand name already exists' });
    }

    const updatedBrand = await Brand.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    if (!updatedBrand) return res.status(404).json({ message: 'Brand not found' });

    res.json({ message: 'Brand updated successfully', updatedBrand });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a brand
brandRoute.delete('/removebrand/:id', async (req, res) => {
  try {
    const deletedBrand = await Brand.findByIdAndDelete(req.params.id);
    if (!deletedBrand) return res.status(404).json({ message: 'Brand not found' });

    // Delete associated image
    if (deletedBrand.imageUrl) {
      const imagePath = path.join(__dirname, '../uploads/brands', path.basename(deletedBrand.imageUrl));
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Image deletion error:', err);
      });
    }

    res.json({ message: 'Brand removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = brandRoute;
