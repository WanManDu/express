const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../schemas'); // Sequelize User 모델 불러오기

// 회원가입 API
router.post('/signup', async (req, res) => {
    const { nickname, password, passwordConfirm } = req.body;

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
    const existingUser = await User.findOne({ where: { nickname } });
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

    try {
        // 비밀번호 해싱 및 사용자 저장
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ nickname, password: hashedPassword });
        console.log("User saved to MySQL:", newUser);

        res.status(201).json({ message: '회원가입이 완료되었습니다.' });
    } catch (error) {
        console.error("회원가입 중 오류 발생:", error);
        res.status(500).json({ message: '회원가입 중 오류가 발생했습니다.' });
    }
});

//사용자 목록 조회
router.get('/users', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'nickname', 'createdAt'] // Retrieve only necessary fields
        });
        res.json({ message: 'User list retrieved successfully', users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: 'Failed to retrieve user list' });
    }
});


// 로그인 API
router.post('/login', async (req, res) => {
    const { nickname, password } = req.body;

    //닉네임 또는 비밀번호를 비워놓았을 시 에러처리
    if(!nickname){
        return res.status(400).json({ message: '닉네임을 입력해주세요'})
    }

    if(!password){
        return res.status(400).json({ message: '비밀번호를 입력해주세요'})
    }

    try {
        // 사용자 검증
        const user = await User.findOne({ where: { nickname } });   //findOne : 특정 조건을 기반으로 첫번 째 일치하는 레코드 찾음.
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: '닉네임 또는 패스워드를 확인해주세요.' });
        }

        console.log("User on Login:", user);

        // JWT 토큰 발행
        const jwtSecret = process.env.JWT_SECRET;
        const token = jwt.sign({ user_id: user.id, nickname: user.nickname }, jwtSecret, { expiresIn: '1h' });

        console.log("Generated JWT Token:", token);

        res.cookie('token', token, { httpOnly: true });
        res.json({ message: '로그인 성공', nickname });
    } catch (error) {
        console.error("로그인 중 오류 발생:", error);
        res.status(500).json({ message: '로그인 중 오류가 발생했습니다.' });
    }

});

// 로그아웃 API
router.get('/logout', (req, res) => {
    res.clearCookie('token'); // JWT 쿠키 삭제
    res.json({ message: '로그아웃 성공' });
});

module.exports = router;
