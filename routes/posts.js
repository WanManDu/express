const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');


router.get('/mainpage/:id', async (req, res) => {
    const db = req.app.locals.db;
    
    try {
        // 필요한 필드만 가져오고, 날짜 기준으로 내림차순 정렬 및 페이지네이션
        let result = await db.collection('post')
            .find({}, { projection: { title: 1, author: 1, date: 1 } }) // 제목, 작성자, 작성 날짜만 선택
            .sort({ date: -1 }) // 작성 날짜 기준 내림차순 정렬
            .skip((req.params.id - 1) * 10) // 게시글 10개씩 페이지 구분
            .limit(10)
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
        const poster = await db.collection('posters').findOne({ _id: new ObjectId(post_id) });
        
        if (!poster) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        console.log("Poster:", poster);
        res.json({ message: '게시글 조회 성공', poster });
    } catch (error) {
        console.error("Error fetching poster:", error);
        res.status(500).json({ message: '게시글을 불러오는 데 문제가 발생했습니다.' });
    }
});

//게시글 작성 API
router.post('/', async (req, res) => {
    const date = new Date();
    const { title, user, content, password } = req.body;
    const db = req.app.locals.db; 

    // 입력 필드 유효성 검사
    if (!title) {
        return res.status(400).json({ message: '제목을 입력해주세요' });
    }

    if (!user) {
        return res.status(400).json({ message: '사용자명을 입력해주세요' });
    }

    if (!content) {
        return res.status(400).json({ message: '내용을 입력해주세요' });
    }

    if (!password) {
        return res.status(400).json({ message: '비밀번호를 입력해주세요' });
    }

    // MongoDB에 데이터 삽입
    const result = await db.collection('posters').insertOne({ title, user, content, date, password });

    console.log("Poster was saved to MongoDB:", result);

    // 성공 응답
    res.status(201).json({ message: '게시글 작성 완료' });
});


//게시글 수정 API
router.put('/postupdate/:post_id', async (req, res) => {
    const db = req.app.locals.db;
    const { post_id } = req.params;
    const { title, content, passwordConfirm } = req.body;

    // 입력 필드 유효성 검사
    if (!title) {
        return res.status(400).json({ message: '제목을 입력해주세요' });
    }
    if (!content) {
        return res.status(400).json({ message: '내용을 입력해주세요' });
    }
    if (!passwordConfirm) {
        return res.status(400).json({ message: '비밀번호를 입력해주세요' });
    }

    try {
        // 게시글을 찾아 기존 비밀번호와 일치하는지 확인
        const existingPost = await db.collection('posters').findOne({ _id: new ObjectId(post_id) });
        
        if (existingPost.password !== passwordConfirm) {
            return res.status(400).json({ message: '비밀번호가 일치하지 않습니다.' });
        }

        if (!existingPost) {
            return res.status(400).json({ message: '게시글이 없습니다.' });
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
router.delete('/:post_id', async (req, res) => {
    const db = req.app.locals.db;
    const { post_id } = req.params;
    const { password } = req.body;

    try {
        const result = await db.collection('posters').deleteOne({ _id: new ObjectId(post_id), password });

        if (result.deletedCount === 0) {
            return res.status(400).json({ message: '게시글이 없거나 비밀번호가 일치하지 않습니다.' });
        }

        // 관련 댓글 삭제
        await db.collection('comments').deleteMany({ post_id: new ObjectId(post_id) });

        console.log("Poster was deleted from MongoDB:", result);
        res.status(200).json({ message: '게시글 삭제 완료' });
    } catch (error) {
        console.error("Error deleting poster:", error);
        res.status(500).json({ message: '게시글 삭제에 실패했습니다.' });
    }
});




module.exports = router;