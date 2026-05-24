/**
 * seed.js — Import existing frontend JSON data into the backend data/ folder.
 * Run ONCE after setting up the backend:
 *   node seed.js
 *
 * This reads the JSON files from src/features/ and writes them into
 * backend/data/ with proper IDs added to each record.
 */

require('dotenv').config();
const fs   = require('fs');
const path = require('path');

// ─── PATHS ────────────────────────────────────────────────────────────────────
const ROOT        = path.join(__dirname, '..');
const BACKEND_DATA = path.join(__dirname, 'data');

const SOURCE = {
  people:   path.join(ROOT, 'src', 'features', 'people',   'people.json'),
  articles: path.join(ROOT, 'src', 'features', 'articles', 'articles.json'),
  projects: path.join(ROOT, 'src', 'features', 'projects', 'projects.json'),
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function ensureDataDir() {
  if (!fs.existsSync(BACKEND_DATA)) {
    fs.mkdirSync(BACKEND_DATA, { recursive: true });
    console.log(`📁 Created: backend/data/`);
  }
}

function readSource(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  Source not found, skipping: ${filePath}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    console.error(`❌ Failed to parse: ${filePath}`, e.message);
    return null;
  }
}

function writeDest(collection, data) {
  const dest = path.join(BACKEND_DATA, `${collection}.json`);
  fs.writeFileSync(dest, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ Seeded ${collection}: ${data.length} records → backend/data/${collection}.json`);
}

// ─── SEED LOGIC ───────────────────────────────────────────────────────────────
function seedPeople() {
  const raw = readSource(SOURCE.people);
  if (!raw) return;

  const data = Array.isArray(raw) ? raw : Object.values(raw);
  const seeded = data.map((p, i) => ({
    id:        p.id || generateId(),
    name:      p.name      || '',
    role:      p.role      || p.position || '',
    bio:       p.bio       || p.description || '',
    image:     p.image     || p.photo || '',
    email:     p.email     || '',
    linkedin:  p.linkedin  || '',
    order:     p.order     != null ? p.order : i,
    active:    p.active    != null ? p.active : true,
    createdAt: p.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  writeDest('people', seeded);
}

function seedArticles() {
  const raw = readSource(SOURCE.articles);
  if (!raw) return;

  const data = Array.isArray(raw) ? raw : Object.values(raw);
  const seeded = data.map(a => ({
    id:        a.id      || generateId(),
    title:     a.title   || '',
    excerpt:   a.excerpt || a.summary || '',
    content:   a.content || a.body    || '',
    image:     a.image   || a.cover   || '',
    author:    a.author  || 'AIRL Nepal',
    tags:      Array.isArray(a.tags) ? a.tags : (a.tags ? [a.tags] : []),
    date:      a.date    || a.createdAt || new Date().toISOString(),
    published: a.published != null ? a.published : true,
    createdAt: a.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  writeDest('articles', seeded);
}

function seedProjects() {
  // Projects aren't in the API yet but seed the data file for future use
  const raw = readSource(SOURCE.projects);
  if (!raw) return;

  const data = Array.isArray(raw) ? raw : Object.values(raw);
  const seeded = data.map((p, i) => ({
    id:        p.id || generateId(),
    ...p,
    createdAt: p.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  writeDest('projects', seeded);
}

function seedMessages() {
  // Start with empty messages collection
  const dest = path.join(BACKEND_DATA, 'messages.json');
  if (!fs.existsSync(dest)) {
    fs.writeFileSync(dest, '[]', 'utf-8');
    console.log(`✅ Created empty messages collection → backend/data/messages.json`);
  } else {
    console.log(`ℹ️  messages.json already exists, skipping.`);
  }
}

// ─── RUN ──────────────────────────────────────────────────────────────────────
console.log('\n🌱 AIRL-Nepal — Seeding backend data...\n');
ensureDataDir();
seedPeople();
seedArticles();
seedProjects();
seedMessages();
console.log('\n🎉 Seeding complete. You can now run: npm run dev\n');
