const express = require('express');
const bannerRoute = express.Router();
const Banner = require('../models/Banner');
const { uploadBrandImage, deleteImage } = require('../utils/multer/multer');

// Add a new banner
bannerRoute.post('/', uploadBrandImage.single('imageUrl'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Banner image is required'
      });
    }

    const { targetScreen, isActive } = req.body;
    const imageUrl = req.file.path;
    
    const banner = new Banner({
      imageUrl,
      targetScreen,
      isActive,
    });

    await banner.save();
    res.status(201).json({ 
      message: 'Banner added successfully',
      imageUrl,
      targetScreen,
      isActive
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all banners
bannerRoute.get('/', async (req, res) => {
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
bannerRoute.put('/updatebanner/:id', uploadBrandImage.single('image'), async (req, res) => {
  try {
    const { targetScreen, isActive } = req.body;
    const updatedData = { targetScreen, isActive: isActive === 'true' };

    if (req.file) {
      updatedData.imageUrl = req.file.path;
    }

    const updatedBanner = await Banner.findByIdAndUpdate(req.params.id, updatedData, { new: true });

    if (updatedBanner) {
      res.json({ 
        message: 'Banner updated successfully', 
        updatedBanner,
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
      await deleteImage(deletedBanner.imageUrl);
      res.json({ message: 'Banner removed successfully' });
    } else {
      res.status(404).json({ message: 'Banner not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = bannerRoute;
