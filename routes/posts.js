const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const authMiddleware = require('../middlewares/auth');


router.get('/', async (req, res) => {
    const db = req.app.locals.db;

    try {
        // 필요한 필드만 가져오고, 날짜 기준으로 내림차순 정렬
        const result = await db.collection('posters') 
            .find({}, { projection: { title: 1, nickname: 1, date: 1 } }) // 제목, 작성자, 작성 날짜만 선택
            .sort({ date: -1 }) // 작성 날짜 기준 내림차순 정렬
            .toArray();

        console.log(result); // 데이터를 콘솔에 출력하여 확인
        res.json(result); // 클라이언트에 JSON 형식으로 데이터 전달
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ message: '게시글을 불러오는 데 문제가 발생했습니다.' });
    }
});



//게시글 조회 API
router.get('/:post_id', async (req, res) => {
    const db = req.app.locals.db;
    const { post_id } = req.params;

    try {
        // 게시글 조회
        const post = await db.collection('posters').findOne({ _id: new ObjectId(post_id) });

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
    const date = new Date();
    const { title, content } = req.body;
    const user_id = req.user.user_id; // JWT에서 가져온 user_id
    const nickname = req.user.nickname;
    const db = req.app.locals.db; 

    // 입력 필드 유효성 검사
    if (!title) {
        return res.status(400).json({ message: '제목을 입력해주세요' });
    }

    if (!content) {
        return res.status(400).json({ message: '내용을 입력해주세요' });
    }

    try {

        // MongoDB에 데이터 삽입
        const result = await db.collection('posters').insertOne({ 
            title, 
            nickname: nickname, // 사용자 닉네임 사용
            user_id: user_id,
            content, 
            date 
        });

        console.log("Poster was saved to MongoDB:", result);

        // 성공 응답
        res.status(201).json({ message: '게시글 작성 완료' });
    } catch (error) {
        console.error("Error saving poster to MongoDB:", error);
        res.status(500).json({ message: '게시글 작성 중 오류가 발생했습니다.' });
    }
});



//게시글 수정 API
router.put('/postupdate/:post_id', authMiddleware, async (req, res) => {
    const db = req.app.locals.db;
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
        // 게시글을 찾아 기존 비밀번호와 일치하는지 확인
        const existingPost = await db.collection('posters').findOne({ _id: new ObjectId(post_id) });

        if (!existingPost) {
            return res.status(400).json({ message: '게시글이 없습니다.' });
        }

        // 게시글 작성자 확인
        if (existingPost.user_id.toString() !== user_id) {
            return res.status(403).json({ message: '본인이 작성한 게시글만 수정할 수 있습니다.' });
        }

        // 비밀번호 확인 후, 제목과 내용 업데이트
        const result = await db.collection('posters').updateOne(
            { _id: new ObjectId(post_id) },
            { $set: { title, content } } // date를 업데이트하지 않고 유지
        );

        console.log("Poster was updated in MongoDB:", result);
        res.status(200).json({ message: '게시글 수정 완료' });
    } catch (error) {
        console.error("Error updating poster:", error);
        res.status(500).json({ message: '게시글 수정에 실패했습니다.' });
    }
});


//게시글 삭제 API
router.delete('/:post_id', authMiddleware, async (req, res) => {
    const db = req.app.locals.db;
    const { post_id } = req.params;
    const user_id = req.user.user_id;

    try {
        // 게시글 존재 여부 확인
        const existingPost = await db.collection('posters').findOne({ _id: new ObjectId(post_id) });

        if (!existingPost) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        // 게시글 작성자 확인
        if (existingPost.user_id.toString() !== user_id) {
            return res.status(403).json({ message: '본인이 작성한 게시글만 삭제할 수 있습니다.' });
        }

        // 게시글 삭제
        const result = await db.collection('posters').deleteOne({ _id: new ObjectId(post_id) });

        // 관련 댓글 삭제
        await db.collection('comments').deleteMany({ post_id: new ObjectId(post_id) });

        console.log("Post was deleted from MongoDB:", result);
        res.status(200).json({ message: '게시글 삭제 완료' });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ message: '게시글 삭제에 실패했습니다.' });
    }
});


module.exports = router;