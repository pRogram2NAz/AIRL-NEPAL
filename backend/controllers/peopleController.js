const { readCollection, writeCollection, generateId } = require('../config/db');

const COLLECTION = 'people';

// ─── PAGINATION HELPER ────────────────────────────────────────────────────────
function paginate(array, page, limit) {
  const p = Math.max(1, parseInt(page)  || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const total = array.length;
  const totalPages = Math.ceil(total / l);
  const items = array.slice((p - 1) * l, p * l);
  return { items, total, page: p, limit: l, totalPages };
}

// ─── GET ALL ──────────────────────────────────────────────────────────────────
/**
 * GET /api/people
 * Public. Returns active members sorted by order.
 * Query params: ?page=1  ?limit=20
 */
async function getAll(req, res, next) {
  try {
    let people = await readCollection(COLLECTION);
    people = people
      .filter(p => p.active !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    const { items, total, page, limit, totalPages } = paginate(people, req.query.page, req.query.limit);
    res.json({ data: items, total, page, limit, totalPages });
  } catch (err) {
    next(err);
  }
}

// ─── GET ONE ──────────────────────────────────────────────────────────────────
/**
 * GET /api/people/:id
 * Public.
 */
async function getOne(req, res, next) {
  try {
    const people = await readCollection(COLLECTION);
    const person = people.find(p => p.id === req.params.id);
    if (!person) return res.status(404).json({ error: 'Person not found.' });
    res.json(person);
  } catch (err) {
    next(err);
  }
}

// ─── CREATE ───────────────────────────────────────────────────────────────────
/**
 * POST /api/people   [PROTECTED]
 * Body: { name, role, bio, image, email, linkedin, order }
 */
async function create(req, res, next) {
  try {
    const { name, role, bio = '', image = '', email = '', linkedin = '', order = 0 } = req.body;

    if (!name || !role) {
      return res.status(400).json({ error: 'name and role are required.' });
    }

    const people = await readCollection(COLLECTION);
    const newPerson = {
      id:        generateId(),
      name:      String(name).trim(),
      role:      String(role).trim(),
      bio:       String(bio).trim(),
      image:     String(image).trim(),
      email:     String(email).trim(),
      linkedin:  String(linkedin).trim(),
      order,
      active:    true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    people.push(newPerson);
    await writeCollection(COLLECTION, people);

    res.status(201).json(newPerson);
  } catch (err) {
    next(err);
  }
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────
/**
 * PUT /api/people/:id   [PROTECTED]
 */
async function update(req, res, next) {
  try {
    const people = await readCollection(COLLECTION);
    const index = people.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Person not found.' });

    const allowedFields = ['name', 'role', 'bio', 'image', 'email', 'linkedin', 'order', 'active'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) people[index][field] = req.body[field];
    });
    people[index].updatedAt = new Date().toISOString();

    await writeCollection(COLLECTION, people);
    res.json(people[index]);
  } catch (err) {
    next(err);
  }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
/**
 * DELETE /api/people/:id   [PROTECTED]
 */
async function remove(req, res, next) {
  try {
    const people = await readCollection(COLLECTION);
    const filtered = people.filter(p => p.id !== req.params.id);
    if (filtered.length === people.length) {
      return res.status(404).json({ error: 'Person not found.' });
    }
    await writeCollection(COLLECTION, filtered);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getOne, create, update, remove };
