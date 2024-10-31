// schemas/comment.js
const commentSchema = {
    comment: {
        type: String,
        required: true
    },
    user_id: {
        type: String, // 댓글 작성자의 ID를 나타냄
        required: true
    },
    post_id: {
        type: String, // 댓글이 연결된 게시글의 ID를 나타냄
        required: true
    },
    date: {
        type: Date,
        default: Date.now // 댓글 작성 날짜
    }
};

module.exports = commentSchema;
