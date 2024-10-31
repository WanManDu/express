const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');

//댓글 목록 조회 API
router.get('/:post_id', async (req, res) => {
    const db = req.app.locals.db;
    const { post_id } = req.params;

    try {
        const comments = await db.collection('comments').find({ post_id }).toArray();

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
router.post('/:post_id', async (req, res) => {
    const { comment, user } = req.body; 
    const { post_id } = req.params;     

    const db = req.app.locals.db;

    // 댓글 입력값 유효성 검사
    if (!comment) {
        return res.status(400).json({ message: '댓글을 입력해주세요' });
    }
    
    if (!user) {
        return res.status(400).json({ message: '유효한 사용자명을 제공해주세요' });
    }

    try {

        const existingUser = await db.collection('users').findOne({ nickname: user });
        if (!existingUser) {
            return res.status(400).json({ message: '존재하지 않는 사용자입니다.' });
        }
        
        // 댓글 생성
        const newComment = {
            comment,
            post_id: new ObjectId(post_id), // 게시글 ID
            user,                           // 사용자명
            date: new Date()                // 작성 시간
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
router.put('/commentupdate/:comment_id', async (req, res) => {
    const db = req.app.locals.db;
    const { comment_id } = req.params;
    const { comment, user } = req.body;

    if (!comment) {
        return res.status(400).json({ message: '수정할 댓글을 입력해주세요' });
    }

    try {
        const existingComment = await db.collection('comments').findOne({ _id: new ObjectId(comment_id) });
        
        if (!existingComment) {
            return res.status(404).json({ message: '댓글이 존재하지 않습니다.' });
        }

        if (existingComment.user.toString() !== user) {
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
router.delete('/:comment_id', async (req, res) => {
    const db = req.app.locals.db;
    const { comment_id } = req.params;
    const { nickname } = req.body; // 삭제 요청 시 사용자 nickname

    // 입력값 유효성 검사
    if (!nickname) {
        return res.status(400).json({ message: '유효한 사용자 닉네임을 제공해주세요' });
    }

    try {
        // 댓글 찾기
        const existingComment = await db.collection('comments').findOne({ _id: new ObjectId(comment_id) });

        if (!existingComment) {
            return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
        }

        // 삭제 권한 확인
        if (existingComment.user !== nickname) { // 댓글 작성자와 비교
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
