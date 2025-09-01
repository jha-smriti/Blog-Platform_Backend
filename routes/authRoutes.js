const express = require('express');
const router = express.Router();
const { loginUser, registerUser , getMe , logoutUser } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
router.post('/login', loginUser);
router.post('/signup', registerUser);
router.get('/me', authenticateToken, getMe);   
router.post('/logout', logoutUser);

module.exports = router;
