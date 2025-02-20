const bcrypt = require('bcryptjs');

const users= [
    {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com",
        "phone": "123-456-7890",
        "password": bcrypt.hashSync("johnpassword", 10)
    },
    {
        "first_name": "Jane",
        "last_name": "Smith",
        "email": "jane.smith@example.com",
        "phone": "123-456-7890",
        "password": bcrypt.hashSync("janepassword", 10)
    },
    {
        "first_name": "Mike",
        "last_name": "Johnson",
        "email": "mike.johnson@example.com",
        "phone": "123-456-7890",
        "password": bcrypt.hashSync("mikepassword", 10)
    }
]


module.exports = users;