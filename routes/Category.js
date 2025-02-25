const multer = require('multer');
const express = require('express');
const categoryRouter = express.Router();
const path = require('path');
const fs = require('fs');

const {Category, SubCategory} = require('../models/Category');

// Define absolute path to uploads directory
const uploadsDir = path.resolve(__dirname, '../uploads');
console.log('Absolute uploads directory path:', uploadsDir);

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory at:', uploadsDir);
}

// Configure storage for file uploads with absolute path
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function(req, file, cb) {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({ storage: storage });

// Add Category
categoryRouter.post('/addcategory', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }
        
        const { name, isFeatured } = req.body;
        console.log('File uploaded:', req.file); // Debug info
        
        // Store absolute file path in database
        const absoluteImagePath = path.join(uploadsDir, req.file.filename);
        // But use relative URL for client access
        const imageUrl = `/uploads/${req.file.filename}`;
        
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ message: 'Category already exists' });
        }
        
        const category = new Category({ 
            name, 
            isFeatured, 
            imageUrl: `${req.protocol}://${req.get('host')}${imageUrl}`,
            absolutePath: absoluteImagePath // Optional: store absolute path if needed
        });
        await category.save();
        
        res.json({ 
            message: 'Category added successfully', 
            category: {
                ...category.toObject(),
                fullUrl: `${req.protocol}://${req.get('host')}${imageUrl}`
            }
        });
    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get All Categories
categoryRouter.get('/allcategories', async (req, res) => {
    try {
        const categories = await Category.find();
        
        // Add full URLs to the response
        const categoriesWithUrls = categories.map(category => {
            return {
                ...category.toObject(),
             
            };
        });
        
        res.json(categoriesWithUrls);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete Category
categoryRouter.delete('/removecategory', async (req, res) => {
    try {
        const { name } = req.body;
        const deletedCategory = await Category.findOneAndDelete({ name });
        
        if (deletedCategory) {
            // Use absolute path for file deletion
            let imagePath;
            
            if (deletedCategory.absolutePath) {
                // If we stored the absolute path, use it directly
                imagePath = deletedCategory.absolutePath;
            } else {
                // Otherwise, reconstruct it from the URL
                const filename = path.basename(deletedCategory.imageUrl);
                imagePath = path.join(uploadsDir, filename);
            }
            
            // Check if file exists before trying to delete
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log(`Deleted image: ${imagePath}`);
            } else {
                console.log(`Image not found at: ${imagePath}`);
            }
            
            res.json({ message: `${name} removed successfully` });
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        console.error('Error removing category:', error);
        res.status(500).json({ message: error.message });
    }
});

// Add SubCategory
categoryRouter.post('/addsubcategory', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }
        
        const { name, description, categoryId } = req.body;
        console.log('File uploaded for subcategory:', req.file);
        
        // Store absolute file path in database
        const absoluteImagePath = path.join(uploadsDir, req.file.filename);
        // But use relative URL for client access
        const imageUrl = `/uploads/${req.file.filename}`;
        
        const subCategory = new SubCategory({
            name,
            description,
            imageUrl: `${req.protocol}://${req.get('host')}${imageUrl}`,
            absolutePath: absoluteImagePath, // Optional: store absolute path if needed
            category: categoryId
        });
        
        await subCategory.save();
        
        res.json({ 
            message: 'SubCategory added successfully', 
            subCategory: {
                ...subCategory.toObject(),
                fullUrl: `${req.protocol}://${req.get('host')}${imageUrl}`
            }
        });
    } catch (error) {
        console.error('Error adding subcategory:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get All SubCategories
categoryRouter.get('/allsubcategories', async (req, res) => {
    try {
        const subCategories = await SubCategory.find().populate('category');
        
        // Add full URLs to the response
        const subCategoriesWithUrls = subCategories.map(subCategory => {
            return {
                ...subCategory.toObject(),
              
            };
        });
        
        res.json(subCategoriesWithUrls);
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete SubCategory
categoryRouter.delete('/removesubcategory', async (req, res) => {
    try {
        const { name } = req.body;
        const deletedSubCategory = await SubCategory.findOneAndDelete({ name });
        
        if (deletedSubCategory) {
            // Use absolute path for file deletion
            let imagePath;
            
            if (deletedSubCategory.absolutePath) {
                // If we stored the absolute path, use it directly
                imagePath = deletedSubCategory.absolutePath;
            } else {
                // Otherwise, reconstruct it from the URL
                const filename = path.basename(deletedSubCategory.imageUrl);
                imagePath = path.join(uploadsDir, filename);
            }
            
            // Check if file exists before trying to delete
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log(`Deleted image: ${imagePath}`);
            } else {
                console.log(`Image not found at: ${imagePath}`);
            }
            
            res.json({ message: `${name} subcategory removed successfully` });
        } else {
            res.status(404).json({ message: 'SubCategory not found' });
        }
    } catch (error) {
        console.error('Error removing subcategory:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = categoryRouter;