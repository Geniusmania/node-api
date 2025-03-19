const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const protect = require('../routes/middleware/Auth');
const authRoute = express.Router();

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: "pbaidoo.pb10@gmail.com",
    pass: "qzcxwuoiznhdyufr",
  },
});

// Send verification email
async function sendVerificationEmail(email, token) {
  const verificationLink = `https://node-api-3548.onrender.com/${token}`;
  const mailOptions = {
    from: `"Shoppy" <pbaidoo.pb10@gmail.com>`,
    to: email,
    subject: 'Verify Your Email - Shoppy',
    html: `
      <h2>Welcome to shoppy!</h2>
      <p>Click the link below to verify your email. This link will expire in 20 minutes:</p>
      <a href="${verificationLink}">Verify Email</a>
      <p>If you did not request this, please ignore this email.</p>
    `,
  };
  await transporter.sendMail(mailOptions);
}

// Generate JWT Token
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};


//  Register User
authRoute.post('/register', async (req, res) => {
  const { first_name, last_name, email, password, username, phone, isAdmin } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = Date.now() + 20 * 60 * 1000;

    const user = await User.create({
      first_name,
      last_name,
      email,
      password,
      username,
      phone,
      isAdmin,
      isVerified: false,
      verificationToken,
      verificationTokenExpires: tokenExpiry,
    });

    if (user) {
      await sendVerificationEmail(email, verificationToken);
      res.status(201).json({
        message: 'User registered. Please check your email to verify your account.',
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Email Verification Endpoint
authRoute.get('/verify/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }
 // Check if the token has expired
 if (user.verificationTokenExpires < Date.now()) {
  return res.status(400).json({ message: 'Verification link expired. Please request a new one.' });
}
    user.verified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Email successfully verified. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

authRoute.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: 'User not found.' });
  if (user.verified) return res.status(400).json({ message: 'Email already verified.' });

  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.verificationToken = verificationToken;
  user.verificationTokenExpires = Date.now() + 24 * 60 * 1000;
  await user.save();

  await sendVerificationEmail(email, verificationToken);
  res.status(200).json({ message: 'Verification email resent successfully.' });
});


//  Login User (Restrict unverified users)
authRoute.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.verified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    if (user && (await user.matchPassword(password))) {
      res.json({message: 'Logged in succesfull',
        user: {
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          username: user.username,
          phone: user.phone,
          isAdmin: user.isAdmin
        },
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
