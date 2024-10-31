const express = require('express');
const router = express.Router();

const authRoute = require('./auth');
const postsRoute = require('./posts');
const commentsRoute = require('./comments');

// 각각의 라우트 등록
router.use('/auth', authRoute);
router.use('/posts', postsRoute);
router.use('/comments', commentsRoute);

module.exports = router;