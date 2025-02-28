
const cloudinary = require('../cloudinary/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// storage for product images
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecommerce/products',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'PNG','JPG','JPEG','WEBP'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  }
});

// storage for brand images
const brandStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecommerce/brands',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'PNG','JPG','JPEG','WEBP'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

// //storage for banners image
// const bannerStorage = new CloudinaryStorage({
//     cloudinary:cloudinary,
//     params:{
//         folder:'ecommerce/banner',
//         allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'PNG','JPG','JPEG','WEBP'],
//         transformation: [{ width: 1000, height: 500, crop: 'limit' }]
//     }
// })

// Multer upload configurations

const uploadProductImage = multer({ storage: productStorage });
const uploadBrandImage = multer({ storage: brandStorage });

// Function to delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    if (!publicId) return null;
    // Extract public ID from URL if it's a URL
    if (publicId.includes('cloudinary.com')) {
      const parts = publicId.split('/');
      const filenameWithExt = parts[parts.length - 1];
      const filename = filenameWithExt.split('.')[0];
      const folder = parts[parts.length - 2];
      publicId = `${folder}/${filename}`;
    }
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return null;
  }
};

module.exports = {
  uploadProductImage,
  uploadBrandImage,
  deleteImage
};