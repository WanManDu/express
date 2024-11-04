// schemas/post.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('./index'); // sequelize 인스턴스 가져오기

module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define('Post', {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        nickname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        user_id: {  // 작성자 ID
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',  // User 모델을 참조
                key: 'id'
            }
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    });
    return Post;
};
