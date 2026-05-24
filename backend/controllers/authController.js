const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * POST /api/auth/login
 * Body: { username, password }
 * Returns: { token, expiresIn }
 */
async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    if (username !== process.env.ADMIN_USERNAME) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const hashFromEnv = process.env.ADMIN_PASSWORD_HASH;
    if (!hashFromEnv) {
      return res.status(500).json({ error: 'Server misconfiguration: no password hash set.' });
    }

    const isMatch = await bcrypt.compare(password, hashFromEnv);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // JWT expiry — configurable via JWT_EXPIRES_IN in .env, defaults to 8h
    const expiresIn = process.env.JWT_EXPIRES_IN || '8h';

    const token = jwt.sign(
      { username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    return res.json({ token, expiresIn });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/verify
 * Protected — if middleware passes, token is valid.
 */
function verify(req, res) {
  res.json({ valid: true, admin: req.admin });
}

module.exports = { login, verify };
