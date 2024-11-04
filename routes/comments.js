const express = require('express');
const router = express.Router();
const { Comment, Post } = require('../schemas'); // Sequelize Comment 및 Post 모델 불러오기
const authMiddleware = require('../middlewares/auth');

//댓글 목록 조회 API
router.get('/:post_id', async (req, res) => {
    const { post_id } = req.params;

    try {
        // 게시글 ID로 댓글 조회 및 내림차순 정렬
        const comments = await Comment.findAll({
            where: { post_id },
            order: [['date', 'DESC']],
            attributes: ['comment', 'date']
        });

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
    const { post_id } = req.params;
    const { comment } = req.body;
    const user_id = req.user.user_id;
    const nickname = req.user.nickname;

    // 댓글 입력값 유효성 검사
    if (!comment) {
        return res.status(400).json({ message: '댓글 내용을 입력해주세요' });
    }

    try {
        // 해당 게시글이 존재하는지 확인
        const post = await Post.findByPk(post_id);
        if (!post) {
            return res.status(404).json({ message: '해당 게시글을 찾을 수 없습니다.' });
        }

        // 댓글 생성
        const newComment = await Comment.create({
            post_id,
            comment,
            user_id,
            date: new Date()
        });

        // 생성된 댓글의 ID 확인
        const commentId = newComment.id;
        console.log("New comment ID:", commentId);

        console.log("Comment was saved to MySQL:", newComment);
        res.status(201).json({ message: '댓글 작성 완료' });
    } catch (error) {
        console.error("Error saving comment to MySQL:", error);
        res.status(500).json({ message: '댓글 작성 중 오류가 발생했습니다.' });
    }

});

// 댓글 수정 API
router.put('/commentupdate/:comment_id', authMiddleware, async (req, res) => {
    const { comment_id } = req.params;
    const { comment } = req.body;
    const user_id = req.user.user_id;

    if (!comment) {
        return res.status(400).json({ message: '댓글 내용을 입력해주세요.' });
    }

    try {
        const existingComment = await Comment.findByPk(comment_id);
        
        if (!existingComment) {
            return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
        }

        if (existingComment.user_id !== user_id) {
            return res.status(403).json({ message: '댓글 수정 권한이 없습니다.' });
        }

        // 댓글 수정
        await Comment.update(
            { comment },
            { where: { id: comment_id } }
        );

        console.log("Comment was updated in MySQL");
        res.status(200).json({ message: '댓글 수정 완료' });
    } catch (error) {
        console.error("Error updating comment:", error);
        res.status(500).json({ message: '댓글 수정에 실패했습니다.' });
    }
});

// 댓글 삭제 API
router.delete('/:comment_id', authMiddleware, async (req, res) => {
    const { comment_id } = req.params;
    const user_id = req.user.user_id;

    try {
        // 댓글 찾기
        const existingComment = await Comment.findByPk(comment_id);

        if (!existingComment) {
            return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
        }

        // 삭제 권한 확인
        if (existingComment.user_id !== user_id) { // 댓글 작성자와 비교
            return res.status(403).json({ message: '댓글 삭제 권한이 없습니다.' });
        }

        // 댓글 삭제
        await Comment.destroy({ where: { id: comment_id } });

        console.log("Comment was deleted from MySQL");
        res.status(200).json({ message: '댓글 삭제 완료' });
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ message: '댓글 삭제에 실패했습니다.' });
    }
});

module.exports = router;
