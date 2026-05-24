require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { connectDB }     = require('./config/db');
const { errorHandler }  = require('./middleware/errorHandler');
const { globalLimiter } = require('./middleware/rateLimiter');

// ─── ROUTE IMPORTS ────────────────────────────────────────────────────────────
const authRoutes    = require('./routes/auth');
const peopleRoutes  = require('./routes/people');
const articleRoutes = require('./routes/articles');
const contactRoutes = require('./routes/contact');
const projectRoutes = require('./routes/projects');

// ─── APP INIT ─────────────────────────────────────────────────────────────────
const app      = express();
const PORT     = process.env.PORT     || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Project root is one level above backend/
const PROJECT_ROOT = path.resolve(__dirname, '..');

// ─── CORS ─────────────────────────────────────────────────────────────────────
const buildAllowedOrigins = () => {
  const raw = process.env.CORS_ORIGIN;
  if (!raw) {
    if (NODE_ENV === 'production') {
      console.error('FATAL: CORS_ORIGIN is not set. Refusing to start in production.');
      process.exit(1);
    }
    console.warn('WARNING: CORS_ORIGIN not set. Defaulting to localhost origins for development.');
    return [
      'http://localhost:5000',
      'http://localhost:5500',
      'http://localhost:8000',
      'http://127.0.0.1:5000',
      'http://127.0.0.1:5500',
      'http://127.0.0.1:8000',
    ];
  }
  return raw.split(',').map(o => o.trim()).filter(Boolean);
};

const allowedOrigins = buildAllowedOrigins();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // curl, Postman, same-origin
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin '${origin}' is not allowed.`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ─── BODY PARSING ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── STATIC FILES ─────────────────────────────────────────────────────────────
// Serve the entire project root so the browser can reach:
//   /src/features/home/index.html      → homepage
//   /src/shared/css/style.css          → global stylesheet  ← was 404
//   /src/features/home/main.js         → shared nav/footer JS  ← was 404
//   /src/features/telemetry/telemetry.js  ← was 404
//   /public/images/...
//
// Must be registered BEFORE api routes so static files never go through
// the JSON error handler.
app.use(express.static(PROJECT_ROOT, {
  maxAge: NODE_ENV === 'production' ? '1d' : 0,
  etag: true,
}));

// ─── RATE LIMITING (API only) ─────────────────────────────────────────────────
// Applied after static middleware so file requests are never rate-limited.
app.use('/api/', globalLimiter);

// ─── API ROUTES ───────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/people',   peopleRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/contact',  contactRoutes);
app.use('/api/projects', projectRoutes);

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    project: 'AIRL-Nepal Backend',
    timestamp: new Date().toISOString(),
    env: NODE_ENV,
    dbMode: process.env.DB_MODE || 'json',
  });
});

// ─── 404 — unknown API routes only ───────────────────────────────────────────
app.use('/api/', (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.path}` });
});

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── START ────────────────────────────────────────────────────────────────────
async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🚀  AIRL-Nepal running on   http://localhost:${PORT}`);
    console.log(`🌍  Allowed origins:         ${allowedOrigins.join(', ')}`);
    console.log(`📁  Serving static from:     ${PROJECT_ROOT}`);
    console.log(`📡  Health check:            http://localhost:${PORT}/api/health\n`);
  });
}

start();