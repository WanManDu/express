// schemas/post.js
const postSchema = {
    title: {
        type: String,
        required: true
    },
    user: {
        type: String, // 사용자 닉네임 또는 ID를 나타내는 필드
        required: true
    },
    content: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now // 게시글 작성 날짜
    }
};

module.exports = postSchema;