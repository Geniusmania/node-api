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
dotenv.config();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());







app.use('/api/seed',dbseeder)
//  /login /register /profile /updateprofile /deleteprofile(only admin(/:id)) /getallusers(only admin) /getuserallusers(only admin(/))
app.use('/api/users', userRoute)

//producst
app.use('/api/products', productRoute);

//orders
app.use('/api/orders', orderRoute);

//auth Routes
app.use('/api/auth', authRoute);







mongoose.connect('mongodb+srv://pbaidoopb10:mania123@cluster0.gjnuz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0').then(() => {
    console.log('db connected')
    console.log(process.env.PORT)
    console.log('JWT_SECRET:', process.env.JWT_SECRET)
    app.listen(port, ()=>{
        console.log(`Server is running on port ${port}`);
    })

}


)




