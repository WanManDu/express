const express = require('express');
const routes = require('./routes');
const { sequelize } = require('./schemas');
require('dotenv').config();     //환경변수 로드

const app = express();
app.use(express.json()); // JSON 데이터 파싱

// 데이터베이스 연결 테스트
sequelize.authenticate()
    .then(() => console.log('MySQL 연결 성공'))
    .catch(err => console.error('MySQL 연결 실패:', err));


// 모델을 데이터베이스와 동기화
sequelize.sync({ alter: true });

const cors = require('cors');
app.use(cors({
    origin: 'http://15.164.175.168',
    credentials: true
}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

// 라우트 설정
app.use('/api', routes);

// 서버 실행
app.listen(8080, () => {
    console.log('Server running on http://localhost:8080');
});

