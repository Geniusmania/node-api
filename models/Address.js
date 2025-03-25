const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    name:{type: String, required: true},
    city:{type: String, required: true},
    postalCode:{type: String, required: true},
    phoneNumber:{type: String, required: true},
    isSelected:{type: Boolean, default: false},
    user:{type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Address', addressSchema);