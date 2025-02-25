const express = require('express');
const { default: mongoose } = require('mongoose');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const dbseeder = require('./dbseeder.js');
const dotenv = require('dotenv');
const userRoute = require('./routes/User.js');
const productRoute = require('./routes/Product.js');
const orderRoute = require('./routes/Orders.js');
const authRoute = require('./authentication/login.js');
const categoryRouter = require('./routes/Category.js');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Define absolute path to uploads directory
const uploadsDir = path.resolve(__dirname, 'uploads');
console.log('Absolute uploads directory path in index.js:', uploadsDir);

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory at:', uploadsDir);
}

// Middleware setup
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// Configure static file serving with absolute path
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/seed', dbseeder);

// User routes
app.use('/api/users', userRoute);

// Product routes
app.use('/api/products', productRoute);

// Order routes
app.use('/api/orders', orderRoute);

// Auth routes
app.use('/api/auth', authRoute);

// Category routes
app.use('/api', categoryRouter);

// Database connection and server startup
mongoose.connect('mongodb+srv://pbaidoopb10:mania123@cluster0.gjnuz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => {
        console.log('MongoDB connected successfully');
        console.log('Server port:', process.env.PORT);
        console.log('JWT_SECRET configured:', !!process.env.JWT_SECRET);
        
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
            console.log(`Static files being served from: ${uploadsDir}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });