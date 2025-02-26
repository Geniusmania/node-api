const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    imageUrl: {type: String, required: true, unique: true, trim: true},
    targetScreen: {type: String, required: true},
    isActive: {type: Boolean, default: true},
},
{timestamps: true}

);

module.exports = mongoose.model('Banner', bannerSchema);