const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// 회원가입 API
router.post('/signup', async (req, res) => {
    const { nickname, password, passwordConfirm } = req.body;
    const db = req.app.locals.db; // MongoDB 연결 객체 사용

    //닉네임 또는 비밀번호를 비워놓았을 시 에러처리
    if(!nickname){
        return res.status(400).json({ message: '닉네임을 입력해주세요'})
    }

    if(!password){
        return res.status(400).json({ message: '비밀번호를 입력해주세요'})
    }

    if(!passwordConfirm){
        return res.status(400).json({ message: '비밀번호를 한번 더 입력해주세요'})
    }

    // 닉네임 중복 확인
    const existingUser = await db.collection('users').findOne({ nickname });
    if (existingUser) {
        return res.status(400).json({ message: '중복된 닉네임입니다.' });
    }

    // 닉네임 유효성 검사 (4자 이상, 알파벳과 숫자로만 구성)
    const validNickname = /^[a-zA-Z0-9]{3,}$/;  //알파벳 a~ z, A~Z, 숫자 0 ~9로만 닉네임 구성
    if (!validNickname.test(nickname)) {
        return res.status(400).json({ message: '닉네임은 최소 3자 이상, 알파벳과 숫자로만 구성되어야 합니다.' });
    }

    // 비밀번호 유효성 검사 (4자 이상, 닉네임 포함 불가)
    if (password.length < 4 || password.includes(nickname)) {
        return res.status(400).json({ message: '비밀번호는 최소 4자 이상이어야 하며, 닉네임을 포함할 수 없습니다.' });
    }

    // 비밀번호 확인
    if (password !== passwordConfirm) {
        return res.status(400).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    
    // 비밀번호 해싱 및 사용자 저장
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.collection('users').insertOne({ nickname, password: hashedPassword });
    
    console.log("User saved to MongoDB:", result);

    res.status(201).json({ message: '회원가입이 완료되었습니다.' });
});

// 로그인 API
router.post('/login', async (req, res) => {
    const { nickname, password } = req.body;
    const db = req.app.locals.db;

    //닉네임 또는 비밀번호를 비워놓았을 시 에러처리
    if(!nickname){
        return res.status(400).json({ message: '닉네임을 입력해주세요'})
    }

    if(!password){
        return res.status(400).json({ message: '비밀번호를 입력해주세요'})
    }

    // 사용자 검증
    const user = await db.collection('users').findOne({ nickname });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: '닉네임 또는 패스워드를 확인해주세요.' });
    }
 
    // JWT 토큰 발행
    const jwtSecret = process.env.JWT_SECRET; // 환경 변수에서 JWT 비밀 키 가져오기
    const token = jwt.sign({ user_id: user._id, nickname: user.nickname }, jwtSecret, { expiresIn: '1h' });

    console.log("Generated JWT Token:", token);

    res.cookie('token', token, { httpOnly: true}); // JWT 토큰을 쿠키에 저장
    res.json({ message: '로그인 성공', nickname });
});

// 로그아웃 API
router.get('/logout', (req, res) => {
    res.clearCookie('token'); // JWT 쿠키 삭제
    res.json({ message: '로그아웃 성공' });
});

module.exports = router;
