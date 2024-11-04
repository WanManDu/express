// schemas/index.js
const { Sequelize, DataTypes } = require('sequelize'); // DataTypes를 함께 가져옵니다
require('dotenv').config();

// MySQL 데이터베이스 연결 설정
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
});

// 모델 불러오기
const User = require('./user')(sequelize, DataTypes);
const Post = require('./post')(sequelize, DataTypes);
const Comment = require('./comments')(sequelize, DataTypes);


// 관계 설정
User.hasMany(Post, { foreignKey: 'user_id' });
Post.belongsTo(User, { foreignKey: 'user_id' });

Post.hasMany(Comment, { foreignKey: 'post_id' });
Comment.belongsTo(Post, { foreignKey: 'post_id' });

User.hasMany(Comment, { foreignKey: 'user_id' });
Comment.belongsTo(User, { foreignKey: 'user_id' });

// MySQL 연결 객체 및 모델들 내보내기
module.exports = { sequelize, User, Post, Comment };
