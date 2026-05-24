const express = require('express');
const router = express.Router();
const { createMessage, getAll, markRead, remove } = require('../controllers/contactController');
const { verifyToken } = require('../middleware/auth');
const { contactLimiter } = require('../middleware/rateLimiter');

// Public route — rate limited (5 submissions / hour / IP)
router.post('/', contactLimiter, createMessage);

// Protected routes — admin only
router.get('/', verifyToken, getAll);
router.put('/:id/read', verifyToken, markRead);
router.delete('/:id', verifyToken, remove);

module.exports = router;
