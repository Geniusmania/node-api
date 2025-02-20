const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authRoute = express.Router();

//  Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

//  Register User
authRoute.post('/register', async (req, res) => {
    const { first_name, last_name, email, password, username, phone ,isAdmin} = req.body;
  
    try {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      const user = await User.create({
        first_name,
        last_name,
        email,
        password,
        username,
        phone,
        isAdmin
      });
  
      if (user) {
        res.status(201).json({
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
            phone: user.phone,
          email: user.email,
          isAdmin: user.isAdmin,
        
          token: generateToken(user._id), 
        });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  



// Login User

authRoute.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (user && (await user.matchPassword(password))) {
        res.json({
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken(user._id), 
        });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  
module.exports = authRoute;
