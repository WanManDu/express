const express = require('express');
const { MongoClient } = require('mongodb');
const routes = require('./routes');
require('dotenv').config();     //환경변수 로드

const app = express();
app.use(express.json()); // JSON 데이터 파싱

// MongoDB Atlas 연결 설정
const uri = process.env.MONGO_URL; // 환경 변수에서 MongoDB URL 가져오기
const client = new MongoClient(uri);

const cookieParser = require('cookie-parser');
app.use(cookieParser());

// 라우트 설정
app.use('/api', routes);

// 서버 실행
app.listen(8080, () => {
    console.log('Server running on http://localhost:8080');
});

async function main() {
    try {
        await client.connect();
        console.log("Connected to MongoDB Atlas!");

        // MongoDB 데이터베이스 객체 설정
        app.locals.db = client.db("junglepress");



    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
}

main();
