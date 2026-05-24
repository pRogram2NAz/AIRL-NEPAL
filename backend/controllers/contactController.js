const { readCollection, writeCollection, generateId } = require('../config/db');

const COLLECTION = 'messages';

// ─── PAGINATION HELPER ────────────────────────────────────────────────────────
function paginate(array, page, limit) {
  const p = Math.max(1, parseInt(page)  || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const total = array.length;
  const totalPages = Math.ceil(total / l);
  const items = array.slice((p - 1) * l, p * l);
  return { items, total, page: p, limit: l, totalPages };
}

// ─── CREATE (submit contact form) ─────────────────────────────────────────────
/**
 * POST /api/contact
 * Public. Rate limited at route level (5/hour/IP).
 * Body: { name, email, subject, message, position }
 */
async function createMessage(req, res, next) {
  try {
    const { name, email, subject = '', message, position = '' } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email, and message are required.' });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    // Length guards — prevent oversized payloads slipping past body-parser limits
    if (String(name).trim().length    > 100)  return res.status(400).json({ error: 'name is too long (max 100 chars).' });
    if (String(subject).trim().length > 200)  return res.status(400).json({ error: 'subject is too long (max 200 chars).' });
    if (String(message).trim().length > 5000) return res.status(400).json({ error: 'message is too long (max 5000 chars).' });

    const messages = await readCollection(COLLECTION);
    const newMessage = {
      id:        generateId(),
      name:      String(name).trim(),
      email:     String(email).trim().toLowerCase(),
      subject:   String(subject).trim(),
      message:   String(message).trim(),
      position:  String(position).trim(),
      read:      false,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    messages.push(newMessage);
    await writeCollection(COLLECTION, messages);

    res.status(201).json({ success: true, message: 'Your message has been received. We will get back to you soon.' });
  } catch (err) {
    next(err);
  }
}

// ─── GET ALL (admin only) ─────────────────────────────────────────────────────
/**
 * GET /api/contact   [PROTECTED]
 * Returns messages newest first.
 * Query params: ?unread=true  ?page=1  ?limit=20
 */
async function getAll(req, res, next) {
  try {
    let messages = await readCollection(COLLECTION);

    if (req.query.unread === 'true') {
      messages = messages.filter(m => !m.read);
    }

    messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const { items, total, page, limit, totalPages } = paginate(messages, req.query.page, req.query.limit);
    res.json({ data: items, total, page, limit, totalPages });
  } catch (err) {
    next(err);
  }
}

// ─── MARK READ / UNREAD ───────────────────────────────────────────────────────
/**
 * PUT /api/contact/:id/read   [PROTECTED]
 * Body: { read: true|false }  — defaults to true if omitted
 */
async function markRead(req, res, next) {
  try {
    const messages = await readCollection(COLLECTION);
    const index = messages.findIndex(m => m.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Message not found.' });

    // Allow toggling read/unread — fixes the one-way-only low issue too
    messages[index].read = req.body.read !== undefined ? Boolean(req.body.read) : true;
    await writeCollection(COLLECTION, messages);
    res.json(messages[index]);
  } catch (err) {
    next(err);
  }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
/**
 * DELETE /api/contact/:id   [PROTECTED]
 */
async function remove(req, res, next) {
  try {
    const messages = await readCollection(COLLECTION);
    const filtered = messages.filter(m => m.id !== req.params.id);
    if (filtered.length === messages.length) {
      return res.status(404).json({ error: 'Message not found.' });
    }
    await writeCollection(COLLECTION, filtered);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { createMessage, getAll, markRead, remove };
