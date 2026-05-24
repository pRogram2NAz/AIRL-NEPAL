const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const fsp = require('fs').promises;
const crypto = require('crypto');

// ─── JSON FILE DB HELPERS ────────────────────────────────────────────────────
// Used when DB_MODE=json (default). Stores data in backend/data/*.json files.

const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure the data directory exists synchronously once at startup — acceptable
// because this runs before the server starts accepting requests.
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Async: Read a JSON collection file. Returns [] if file doesn't exist.
 * @param {string} collection - e.g. 'people', 'articles', 'messages'
 * @returns {Promise<Array>}
 */
async function readCollection(collection) {
  const filePath = path.join(DATA_DIR, `${collection}.json`);
  try {
    const raw = await fsp.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    // File doesn't exist yet or is malformed — return empty array
    if (err.code === 'ENOENT' || err instanceof SyntaxError) return [];
    throw err;
  }
}

/**
 * Async: Write an array to a JSON collection file.
 * Uses a write-to-temp-then-rename strategy to prevent data corruption
 * if the process crashes mid-write.
 * @param {string} collection
 * @param {Array} data
 * @returns {Promise<void>}
 */
async function writeCollection(collection, data) {
  const filePath = path.join(DATA_DIR, `${collection}.json`);
  const tmpPath  = `${filePath}.tmp`;
  await fsp.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  await fsp.rename(tmpPath, filePath);
}

/**
 * Generate a cryptographically random unique ID.
 * Uses crypto.randomUUID() (Node 14.17+) — collision-proof.
 * @returns {string} UUID v4
 */
function generateId() {
  return crypto.randomUUID();
}

// ─── MONGODB CONNECTION ──────────────────────────────────────────────────────
// Used when DB_MODE=mongodb

async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
}

// ─── INIT ────────────────────────────────────────────────────────────────────

async function connectDB() {
  const mode = process.env.DB_MODE || 'json';
  if (mode === 'mongodb') {
    await connectMongo();
    console.log('📦 Database mode: MongoDB');
  } else {
    console.log(`📦 Database mode: JSON files (${DATA_DIR})`);
  }
}

module.exports = { connectDB, readCollection, writeCollection, generateId };
