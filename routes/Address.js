const express = require('express');
const addressRouter = express.Router();
const Address = require('../models/Address');
const User = require('../models/User');
const protect = require('./middleware/Auth');



// Get all addresses
addressRouter.get('/',protect, async (req, res) => {
    try {
        const addresses = await Address.find({user: req.user._id});
        res.statusCode(200).json(addresses);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Server error'});
    }
});


//post an address
addressRouter.post('/', protect, async (req, res) => {
    try {
        const {name, city, postalCode, phoneNumber, isSelected} = req.body;

        if(!name || !city || !postalCode || !phoneNumber){
            return res.status(400).json({error: 'Please fill all fields'});
        }
        const address = new Address({
            name,
            city,
            postalCode,
            phoneNumber,
            isSelected,
            user: req.user._id
        });

        const newAddress = await address.save();
        res.status(201).json(newAddress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = addressRouter;
