const express = require('express');
const { MongoClient } = require('mongodb');
const routes = require('./routes');

const app = express();
app.use(express.json()); // JSON 데이터 파싱

// MongoDB Atlas 연결 설정
const uri = "mongodb+srv://sparta:jungle@cluster0.7dkcmsh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

async function main() {
    try {
        await client.connect();
        console.log("Connected to MongoDB Atlas!");

        // MongoDB 데이터베이스 객체 설정
        app.locals.db = client.db("junglepress");

        // 라우트 설정
        app.use('/api', routes);

        // 서버 실행
        app.listen(8080, () => {
            console.log('Server running on http://localhost:8080');
        });
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
}

main();
