const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send-otp', auth.sendOTP);
router.post('/verify-otp', auth.verifyOTP);
router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/refresh-token', auth.refreshToken);
router.post('/logout', protect, auth.logout);

module.exports = router;
