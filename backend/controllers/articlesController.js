const { readCollection, writeCollection, generateId } = require('../config/db');

const COLLECTION = 'articles';

// ─── SANITIZE ────────────────────────────────────────────────────────────────
// Strip dangerous HTML tags/attributes from article content to prevent XSS.
// Uses a simple allowlist — keeps formatting tags, removes scripts/iframes/etc.
// This avoids needing dompurify (which requires a DOM environment server-side).
const ALLOWED_TAGS = new Set([
  'p','br','b','i','em','strong','u','s','ul','ol','li',
  'h1','h2','h3','h4','h5','h6','blockquote','pre','code',
  'a','img','table','thead','tbody','tr','th','td','hr','span','div',
]);

const ALLOWED_ATTRS = {
  a:   ['href', 'title', 'target', 'rel'],
  img: ['src', 'alt', 'width', 'height'],
  '*': ['class'],
};

function sanitizeHtml(html) {
  if (!html || typeof html !== 'string') return '';

  // Remove script/style/iframe blocks entirely (including content)
  let clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/<link[^>]*>/gi, '');

  // Strip on* event handlers from any tag
  clean = clean.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '');

  // Strip javascript: and data: URIs from href/src
  clean = clean.replace(/(href|src)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, '');
  clean = clean.replace(/(href|src)\s*=\s*(?:"data:[^"]*"|'data:[^']*')/gi, '');

  return clean;
}

// ─── PAGINATION HELPER ────────────────────────────────────────────────────────
function paginate(array, page, limit) {
  const p = Math.max(1, parseInt(page)  || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit) || 10));
  const total = array.length;
  const totalPages = Math.ceil(total / l);
  const start = (p - 1) * l;
  const items = array.slice(start, start + l);
  return { items, total, page: p, limit: l, totalPages };
}

// ─── GET ALL ──────────────────────────────────────────────────────────────────
/**
 * GET /api/articles
 * Public. Returns published articles, newest first.
 * Query params: ?tag=xyz  ?page=1  ?limit=10
 */
async function getAll(req, res, next) {
  try {
    let articles = await readCollection(COLLECTION);

    // Only published
    articles = articles.filter(a => a.published !== false);

    // Optional tag filter
    if (req.query.tag) {
      const tag = req.query.tag.toLowerCase();
      articles = articles.filter(a =>
        Array.isArray(a.tags) && a.tags.map(t => t.toLowerCase()).includes(tag)
      );
    }

    // Sort newest first
    articles.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

    // Paginate
    const { items, total, page, limit, totalPages } = paginate(articles, req.query.page, req.query.limit);

    res.json({ data: items, total, page, limit, totalPages });
  } catch (err) {
    next(err);
  }
}

// ─── GET ONE ──────────────────────────────────────────────────────────────────
/**
 * GET /api/articles/:id
 * Public.
 */
async function getOne(req, res, next) {
  try {
    const articles = await readCollection(COLLECTION);
    const article = articles.find(a => a.id === req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found.' });
    res.json(article);
  } catch (err) {
    next(err);
  }
}

// ─── CREATE ───────────────────────────────────────────────────────────────────
/**
 * POST /api/articles   [PROTECTED]
 * Body: { title, excerpt, content, image, author, tags, date, published }
 */
async function create(req, res, next) {
  try {
    const {
      title,
      excerpt = '',
      content = '',
      image = '',
      author = 'AIRL Nepal',
      tags = [],
      date,
      published = true,
    } = req.body;

    if (!title) return res.status(400).json({ error: 'title is required.' });

    const articles = await readCollection(COLLECTION);
    const newArticle = {
      id: generateId(),
      title:     String(title).trim(),
      excerpt:   String(excerpt).trim(),
      content:   sanitizeHtml(content),   // ← XSS sanitized
      image:     String(image).trim(),
      author:    String(author).trim(),
      tags:      Array.isArray(tags) ? tags.map(t => String(t).trim()) : [],
      date:      date || new Date().toISOString(),
      published,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    articles.push(newArticle);
    await writeCollection(COLLECTION, articles);

    res.status(201).json(newArticle);
  } catch (err) {
    next(err);
  }
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────
/**
 * PUT /api/articles/:id   [PROTECTED]
 */
async function update(req, res, next) {
  try {
    const articles = await readCollection(COLLECTION);
    const index = articles.findIndex(a => a.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Article not found.' });

    const allowedFields = ['title', 'excerpt', 'content', 'image', 'author', 'tags', 'date', 'published'];
    allowedFields.forEach(field => {
      if (req.body[field] === undefined) return;
      articles[index][field] = field === 'content'
        ? sanitizeHtml(req.body[field])   // ← XSS sanitized on update too
        : req.body[field];
    });
    articles[index].updatedAt = new Date().toISOString();

    await writeCollection(COLLECTION, articles);
    res.json(articles[index]);
  } catch (err) {
    next(err);
  }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
/**
 * DELETE /api/articles/:id   [PROTECTED]
 */
async function remove(req, res, next) {
  try {
    const articles = await readCollection(COLLECTION);
    const filtered = articles.filter(a => a.id !== req.params.id);
    if (filtered.length === articles.length) {
      return res.status(404).json({ error: 'Article not found.' });
    }
    await writeCollection(COLLECTION, filtered);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getOne, create, update, remove };
