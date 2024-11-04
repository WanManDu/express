// schemas/comment.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('./index'); // sequelize 인스턴스 가져오기

// schemas/comment.js
module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define('Comment', {
        comment: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        user_id: {  // 작성자 ID
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        post_id: {  // 게시글 ID
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Posts',
                key: 'id'
            }
        },
        date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        }
    });
    return Comment;
};

