const express = require('express');
const { default: mongoose } = require('mongoose');
const app = express();

const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const dbseeder = require('./dbseeder.js');
app.use(bodyParser.json());
const dotenv = require('dotenv');
dotenv.config();



mongoose.connect(process.env.mongoDB).then(() => {
    console.log('db connected')
    console.log(process.env.PORT)
    app.listen(port, ()=>{
        console.log(`Server is running on port ${port}`);
    })






app.use('/api/seed',dbseeder)







})




