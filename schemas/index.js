// schemas/index.js
const userSchema = require('./user');
const postSchema = require('./post');
const commentSchema = require('./comment');

module.exports = {
    userSchema,
    postSchema,
    commentSchema
};