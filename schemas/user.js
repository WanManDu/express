// schemas/user.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('./index'); // sequelize 인스턴스 가져오기

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        nickname: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });
    return User;
};