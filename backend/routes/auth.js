const express = require('express');
const router = express.Router();
const { login, verify } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');

// POST /api/auth/login — rate limited (10 failed attempts / 15 min / IP)
router.post('/login', loginLimiter, login);

// GET /api/auth/verify  (protected — used by frontend to check if token still valid)
router.get('/verify', verifyToken, verify);

module.exports = router;
