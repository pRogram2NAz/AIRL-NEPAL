const express = require('express');
const router = express.Router();
const { getAll, getOne, create, update, remove } = require('../controllers/projectsController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.get('/', getAll);
router.get('/:id', getOne);

// Protected routes (admin only)
router.post('/', verifyToken, create);
router.put('/:id', verifyToken, update);
router.delete('/:id', verifyToken, remove);

module.exports = router;
