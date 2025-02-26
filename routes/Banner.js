const express = require('express');
const bannerRoute = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Banner = require('../models/Banner');

// Set up storage for banner uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const bannerDir = path.join(__dirname, '../uploads/banners');
    // Create directory if it doesn't exist
    if (!fs.existsSync(bannerDir)) {
      fs.mkdirSync(bannerDir, { recursive: true });
    }
    cb(null, bannerDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

// Add a new banner
bannerRoute.post('/addbanner', upload.single('image'), async (req, res) => {
  try {
    const { targetScreen, isActive } = req.body;
    
    // Fix the image URL to use the correct path
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/banners/${req.file.filename}`;

    const banner = new Banner({
      imageUrl,
      targetScreen,
      isActive,
    });

    await banner.save();
    res.status(201).json({ 
      message: 'Banner added successfully', 
      imageUrl: imageUrl,//`${req.protocol}://${req.get('host')}${imageUrl}` ,
      targetScreen,
        isActive
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all banners
bannerRoute.get('/allbanners', async (req, res) => {
  try {
    const banners = await Banner.find();
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get active banners
bannerRoute.get('/activebanners', async (req, res) => {
  try {
    const activeBanners = await Banner.find({ isActive: true });
    res.json(activeBanners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a banner
bannerRoute.put('/updatebanner/:id', upload.single('image'), async (req, res) => {
  try {
    const { targetScreen, isActive } = req.body;
    const updatedData = { targetScreen, isActive: isActive === 'true' };

    if (req.file) {
      // Fix the image URL to use the correct path
      updatedData.imageUrl = `/uploads/banners/${req.file.filename}`;
    }

    const updatedBanner = await Banner.findByIdAndUpdate(req.params.id, updatedData, { new: true });

    if (updatedBanner) {
      res.json({ 
        message: 'Banner updated successfully', 
        updatedBanner,
        ImageUrl: req.file ? `${req.protocol}://${req.get('host')}${updatedData.imageUrl}` : null
      });
    } else {
      res.status(404).json({ message: 'Banner not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a banner
bannerRoute.delete('/removebanner/:id', async (req, res) => {
  try {
    const deletedBanner = await Banner.findByIdAndDelete(req.params.id);
    if (deletedBanner) {
      // Fix the path to correctly locate the image file
      const imagePath = path.join(__dirname, '../uploads/banners', path.basename(deletedBanner.imageUrl));
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Image deletion error:', err);
      });
      res.json({ message: 'Banner removed successfully' });
    } else {
      res.status(404).json({ message: 'Banner not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = bannerRoute;