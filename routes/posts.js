const express = require('express');
const router = express.Router();
const { Post, Comment } = require('../schemas'); // Sequelize Post 및 Comment 모델 불러오기
const authMiddleware = require('../middlewares/auth');


router.get('/', async (req, res) => {

    try {
        // 필요한 필드만 가져오고, 날짜 기준으로 내림차순 정렬
        const result = await Post.findAll({
            attributes: ['id', 'title', 'nickname', 'date'], // 제목, 작성자, 작성 날짜만 선택
            order: [['date', 'DESC']], // 작성 날짜 기준 내림차순 정렬
        });

        console.log(result); // 데이터를 콘솔에 출력하여 확인
        res.json(result); // 클라이언트에 JSON 형식으로 데이터 전달
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ message: '게시글을 불러오는 데 문제가 발생했습니다.' });
    }
});

//게시글 조회 API
router.get('/:post_id', async (req, res) => {
    const { post_id } = req.params;

    try {
        // 게시글 조회
        const post = await Post.findByPk(post_id);

        if (!post) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        res.json({ message: '게시글 조회 성공', post });
    } catch (error) {
        console.error("Error fetching post:", error);
        res.status(500).json({ message: '게시글을 불러오는 데 문제가 발생했습니다.' });
    }
});

// 게시글 작성 API
router.post('/', authMiddleware, async (req, res) => {
    const { title, content } = req.body;
    const user_id = req.user.user_id; // JWT에서 가져온 user_id
    const nickname = req.user.nickname;

    console.log("User ID on Post Creation:", user_id);  // 게시글 작성 시 user_id 확인

    // 입력 필드 유효성 검사
    if (!title) {
        return res.status(400).json({ message: '제목을 입력해주세요' });
    }

    if (!content) {
        return res.status(400).json({ message: '내용을 입력해주세요' });
    }

    try {

        // MySQL에 데이터 삽입
        const newPost = await Post.create({
            title,
            nickname,
            user_id,
            content,
            date: new Date()
        });

        console.log("Poster was saved to MySQL:", newPost);
        res.status(201).json({ message: '게시글 작성 완료' });
    } catch (error) {
        console.error("Error saving poster to MySQL:", error);
        res.status(500).json({ message: '게시글 작성 중 오류가 발생했습니다.' });
    }
});



//게시글 수정 API
router.put('/postupdate/:post_id', authMiddleware, async (req, res) => {
    const { post_id } = req.params;
    const { title, content } = req.body;
    const user_id = req.user.user_id;

    // 입력 필드 유효성 검사
    if (!title) {
        return res.status(400).json({ message: '제목을 입력해주세요' });
    }
    if (!content) {
        return res.status(400).json({ message: '내용을 입력해주세요' });
    }

    try {
        // 게시글 조회 및 작성자 확인
        const post = await Post.findByPk(post_id);  //findByPk : 특정 ID(primary key)를 기반으로 레코드 찾음
        if (!post) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }
        if (post.user_id !== user_id) {
            return res.status(403).json({ message: '본인이 작성한 게시글만 수정할 수 있습니다.' });
        }

        // 게시글 업데이트
        await Post.update(
            { title, content },
            { where: { id: post_id } }
        );

        console.log("Poster was updated in MySQL");
        res.status(200).json({ message: '게시글 수정 완료' });
    } catch (error) {
        console.error("Error updating poster:", error);
        res.status(500).json({ message: '게시글 수정에 실패했습니다.' });
    }
});


//게시글 삭제 API
router.delete('/:post_id', authMiddleware, async (req, res) => {
    const { post_id } = req.params;
    const user_id = req.user.user_id;

    try {
        // 게시글 조회 및 작성자 확인
        const post = await Post.findByPk(post_id);
        if (!post) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }
        if (post.user_id !== user_id) {
            return res.status(403).json({ message: '본인이 작성한 게시글만 삭제할 수 있습니다.' });
        }

        // 게시글 삭제
        await Post.destroy({ where: { id: post_id } });

        // 관련 댓글 삭제
        await Comment.destroy({ where: { post_id } });

        console.log("Post was deleted from MySQL");
        res.status(200).json({ message: '게시글 삭제 완료' });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ message: '게시글 삭제에 실패했습니다.' });
    }
});


module.exports = router;