const express = require('express');
const { default: mongoose } = require('mongoose');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const dbseeder = require('./dbseeder.js');
const dotenv = require('dotenv');
const userRoute = require('./routes/User.js');
const productRoute = require('./routes/Product.js');
const orderRoute = require('./routes/Orders.js');
const authRoute = require('./authentication/login.js');
const categoryRouter = require('./routes/Category.js');
const bannerRoute = require('./routes/Banner.js');
const brandRoute = require('./routes/Brand.js')
const path = require('path');
const fs = require('fs');
const addressRouter = require('./routes/Address.js');

// Load environment variables
dotenv.config();

// Define absolute path to uploads directory
const uploadsDir = path.resolve(__dirname, 'uploads');


// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
 
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

//Brand routes
app.use('/api/brands', brandRoute)

// Order routes
app.use('/api/orders', orderRoute);

// Auth routes
app.use('/api/auth', authRoute);

// Category routes
app.use('/api/category', categoryRouter);

// Banner routes
app.use('/api/banner', bannerRoute);

//address routes
app.use('/api/address', addressRouter);




const port = process.env.PORT;
// Database connection and server startup
mongoose.connect(process.env.mongoDB)
    .then(() => {
        console.log('MongoDB connected successfully');
        
        console.log('JWT_SECRET configured:', !!process.env.JWT_SECRET);
        
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });