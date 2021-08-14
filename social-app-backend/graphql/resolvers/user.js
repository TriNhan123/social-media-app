const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');

const { SECRET_KEY} = require('../../config');
const User = require('../../models/User');
const { validateRegisterInput, validateLoginInput } = require('../../util/validators');

const generateToken = (user) => jwt.sign({
    id: user.id,
    email: user.email,
    username: user.username
}, SECRET_KEY, { expiresIn: '1h'});

module.exports = {
    Mutation: {
        async register(
        _,
        {
            registerInput: { username, email, password, confirmPassword }
        }
        ) {
        // Validate user data
            const { valid, errors } = validateRegisterInput(
                username,
                email,
                password,
                confirmPassword
            );
            if (!valid) {
                throw new UserInputError('Errors', { errors });
            }
            // TODO: Make sure user doesnt already exist
            const user = await User.findOne({ username });
            if (user) {
                throw new UserInputError('Username is taken', {
                errors: {
                    username: 'This username is taken'
                }
                });
            }
            // hash password and create an auth token
            password = await bcrypt.hash(password, 12);

            const newUser = new User({
                email,
                username,
                password,
                createdAt: new Date().toISOString()
            });

            const res = await newUser.save();

            const token = generateToken(res);

            return {
                ...res._doc,
                id: res._id,
                token
            };
        },
        async login (_, {username, password})
        {
            const{ valid, errors } = validateLoginInput(username, password);
            const user = await User.findOne({username});

            if(!valid){
                throw new UserInputError('Errors', { errors });
            }
            
            if(!user){
                errors.general = 'User not found';
                throw new UserInputError('User not found', { errors });
            }
            const match = await bcrypt.compare(password, user.password);
            if(!match){
                errors.general = 'Wrong credentials';
                throw new UserInputError('Wrong credentials', { errors });
            }
            const token = generateToken(user)
            return {
                ...user._doc,
                id: user._id,
                token 
            };
        },
    }
};