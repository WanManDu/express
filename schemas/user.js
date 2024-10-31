
const userSchema = {
    nickname: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
};

module.exports = userSchema;
