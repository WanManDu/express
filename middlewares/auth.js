// middlewares/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config(); // 환경 변수 로드

function authMiddleware(req, res, next) {
    console.log('Auth Middleware Cookies:', req.cookies);
    const token = req.cookies.token; // 쿠키에서 토큰 가져오기

    if (!token) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    try {
        const jwtSecret = process.env.JWT_SECRET; // 환경 변수에서 JWT 비밀 키 가져오기
        const decoded = jwt.verify(token, jwtSecret); // 토큰 검증
        console.log(decoded);

        req.user = {
            user_id: decoded.user_id,  // user_id가 포함되어 있어야 합니다
            nickname: decoded.nickname
        };
        next(); // 다음 미들웨어 또는 라우트로 이동
    } catch (error) {
        return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    }
}

module.exports = authMiddleware;


