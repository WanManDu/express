const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const authMiddleware = require('../middlewares/auth');

//댓글 목록 조회 API
router.get('/:post_id', async (req, res) => {
    const db = req.app.locals.db;
    const { post_id } = req.params;

    try {
        const comments = await db.collection('comments')
            .find({ post_id: new ObjectId(post_id) }) // 게시글 ID로 댓글 필터링
            .sort({ date: -1 }) // 작성 날짜 기준 내림차순 정렬
            .toArray();

        if (comments.length === 0) {
            return res.status(404).json({ message: '댓글이 없습니다.' });
        }
            
        console.log("Comments:", comments);
        res.json({ message: '댓글 조회 성공', comments });
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ message: '댓글을 불러오는 데 문제가 발생했습니다.' });
    }
});

// 댓글 작성 API
router.post('/:post_id', authMiddleware, async (req, res) => {
    const db = req.app.locals.db;
    const { post_id } = req.params;
    const { comment } = req.body;
    const user_id = req.user.user_id;
    const nickname = req.user.nickname;
    const date = new Date();

    // 댓글 입력값 유효성 검사
    if (!comment) {
        return res.status(400).json({ message: '댓글 내용을 입력해주세요' });
    }

    try {
        
        // 댓글 생성
        const newComment = {
            post_id: new ObjectId(post_id), // 게시글 ID
            comment,
            nickname: nickname,
            user_id : user_id,                           // 사용자명
            date                            // 작성 시간
        };

        const result = await db.collection('comments').insertOne(newComment);

        console.log("Comment was saved to MongoDb:", result);

        res.status(201).json({ message: '댓글 작성 완료' });
    } catch (error) {
        console.error("Error saving comment to MongoDB:", error);
        res.status(500).json({ message: '댓글 작성 중 오류가 발생했습니다.' });
    }
});

// 댓글 수정 API
router.put('/commentupdate/:comment_id', authMiddleware, async (req, res) => {
    const db = req.app.locals.db;
    const { comment_id } = req.params;
    const { comment } = req.body;
    const user_id = req.user.user_id;

    if (!comment) {
        return res.status(400).json({ message: '댓글 내용을 입력해주세요.' });
    }

    try {
        const existingComment = await db.collection('comments').findOne({ _id: new ObjectId(comment_id) });
        
        if (!existingComment) {
            return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
        }

        if (existingComment.user_id.toString() !== user_id) {
            return res.status(403).json({ message: '댓글 수정 권한이 없습니다.' });
        }

        const result = await db.collection('comments').updateOne(
            { _id: new ObjectId(comment_id) },
            { $set: { comment } }
        );

        console.log("Comment was updated in MongoDB:", result);
        res.status(200).json({ message: '댓글 수정 완료' });
    } catch (error) {
        console.error("Error updating comment:", error);
        res.status(500).json({ message: '댓글 수정에 실패했습니다.' });
    }
});
// 댓글 삭제 API
router.delete('/:comment_id', authMiddleware, async (req, res) => {
    const db = req.app.locals.db;
    const { comment_id } = req.params;
    const user_id = req.user.user_id;

    try {
        // 댓글 찾기
        const existingComment = await db.collection('comments').findOne({ _id: new ObjectId(comment_id) });

        if (!existingComment) {
            return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
        }

        // 삭제 권한 확인
        if (existingComment.user_id !== user_id) { // 댓글 작성자와 비교
            return res.status(403).json({ message: '댓글 삭제 권한이 없습니다.' });
        }

        // 댓글 삭제
        const result = await db.collection('comments').deleteOne({ _id: new ObjectId(comment_id) });

        console.log("Comment was deleted from MongoDB:", result);
        res.status(200).json({ message: '댓글 삭제 완료' });
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ message: '댓글 삭제에 실패했습니다.' });
    }
});

module.exports = router;
