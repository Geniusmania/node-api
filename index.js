const express = require('express');
const { default: mongoose } = require('mongoose');
const app = express();

const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const dbseeder = require('./dbseeder.js');
app.use(bodyParser.json());
const dotenv = require('dotenv');
const userRoute = require('./routes/User.js');
const productRoute = require('./routes/Product.js');
const orderRoute = require('./routes/Orders.js');
const authRoute = require('./authentication/login.js');
dotenv.config();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());







app.use('/api/seed',dbseeder)
//  /login /register /profile /updateprofile /deleteprofile(only admin(/:id)) /getallusers(only admin) /getuserallusers(only admin(/))
app.use('/api/users', userRoute)

//producst
app.use('/api/products', productRoute);

//orders
app.use('/api/orders', orderRoute);

//auth Routes
app.use('/api/auth', authRoute);







mongoose.connect(process.env.mongoDB).then(() => {
    console.log('db connected')
    console.log(process.env.PORT)
    app.listen(port, ()=>{
        console.log(`Server is running on port ${port}`);
    })

})




