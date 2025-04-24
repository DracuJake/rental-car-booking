const express = require('express');
const { register,login,logout,getUser,loginByGmail,loginByGmailCallback} = require('../controllers/auth');

const router = express.Router();
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me',protect,getUser);
router.get('/google',loginByGmail);
router.get('/google/callback',loginByGmailCallback);

module.exports = router;
