const bcrypt = require('bcryptjs');

const users= [
    {
        name : "Admin",
        email :"admin@example.com",
        password : bcrypt.hashSync("password123", 10),
        isAdmin: true,
    },
    {
        name : "User",
        email :"john@example.com",
        password : bcrypt.hashSync("password123", 10),
       
    },

]

module.exports = users;