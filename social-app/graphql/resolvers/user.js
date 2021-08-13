const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { SECRET_KEY} = require('../../config');
const User = require('../../models/User');

module.exports = {
    Mutation: {
        async register(
            _, 
            {
            registerInput: {username, email, password, comfirmPassword}
            }, 
            context, 
            info
            ){
            // TODO: Validate user data 
            // TODO: Make sure user hasn't already exist
            // TODO: hash password and create an auth token 
            password = await bcrypt.hash(password, 12)
            const newUser = new User({
                email,
                username, 
                password, 
                createdAt: new Date().toISOString()
            });
            
            //save new registered user to db 
            const res = await newUser.save();

            const token = jwt.sign({
                id: res.id,
                email: res.email,
                username: res.username
            }, SECRET_KEY, { expiresIn: '1h'});

            return {
                ...res._doc,
                id: res._id,
                token 
            };
        }
    }
}