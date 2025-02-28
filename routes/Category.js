const express = require('express');
const categoryRouter = express.Router();
const { Category, SubCategory } = require('../models/Category');
const { uploadBrandImage, deleteImage } = require('../utils/multer/multer');

// Add Category
categoryRouter.post('/', uploadBrandImage.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }
        
        const { name, isFeatured } = req.body;
        const imageUrl = req.file.path;
        
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ message: 'Category already exists' });
        }
        
        const category = new Category({ 
            name, 
            isFeatured, 
            imageUrl
        });
        await category.save();
        
        res.json({ message: 'Category added successfully', category });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get All Categories
categoryRouter.get('/', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete Category
categoryRouter.delete('/removecategory', async (req, res) => {
    try {
        const { name } = req.body;
        const deletedCategory = await Category.findOneAndDelete({ name });
        
        if (deletedCategory) {
            await deleteImage(deletedCategory.imageUrl);
            res.json({ message: `${name} removed successfully` });
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add SubCategory
categoryRouter.post('/addsubcategory', uploadBrandImage.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }
        
        const { name, description, categoryId } = req.body;
        const imageUrl = req.file.path;
        
        const subCategory = new SubCategory({
            name,
            description,
            imageUrl,
            category: categoryId
        });
        
        await subCategory.save();
        
        res.json({ message: 'SubCategory added successfully', subCategory });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get All SubCategories
categoryRouter.get('/allsubcategories', async (req, res) => {
    try {
        const subCategories = await SubCategory.find().populate('category');
        res.json(subCategories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete SubCategory
categoryRouter.delete('/removesubcategory', async (req, res) => {
    try {
        const { name } = req.body;
        const deletedSubCategory = await SubCategory.findOneAndDelete({ name });
        
        if (deletedSubCategory) {
            await deleteImage(deletedSubCategory.imageUrl);
            res.json({ message: `${name} subcategory removed successfully` });
        } else {
            res.status(404).json({ message: 'SubCategory not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = categoryRouter;
