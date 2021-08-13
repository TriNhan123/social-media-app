const { model, Schema } = require('mongoose');

const postSchema = new Schema({
    body: String,
    username: String,
    createdAt: String,
    comments: [
        {
            body: String, 
            username: String, 
            createdAt: String
        }
    ],
    upvotes: [
        {
            username: String,
            createdAt: String
        }
    ],
    //no relations bt models so link it here
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    }
});

module.exports = model('Post', postSchema);
