const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');

const { SECRET_KEY} = require('../../config');
const User = require('../../models/User');
const { validateRegisterInput } = require('../../util/validators');

module.exports = {
    Mutation: {
        async register(
            _, 
            {
            registerInput: {username, email, password, comfirmPassword }
            }
            ){
            // Validate user data 
            const { valid, errors } = validateRegisterInput(
                username, 
                email, 
                password, 
                comfirmPassword
            );
            if(!valid){
                throw new UserInputError('Errors', { errors });
            }

            //Make sure user hasn't already exist
            const user = User.findOne({ username });
            if(user){
                throw new UserInputError('Username is taken', {
                    errors: {
                        username: 'This username is taken'
                    }
                })
            }
                
            // hash password and create an auth token 
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
};