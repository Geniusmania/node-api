const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
dotenv.config();

cloudinary.config({
    cloud_name: 'de2h0anee',
    api_key: '521862963828862',
    api_secret: 'EcP8cvRVwZgaKNDKpw1VX-MOYRY', 

})

module.exports = cloudinary;