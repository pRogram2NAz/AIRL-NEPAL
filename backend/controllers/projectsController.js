const { readCollection, writeCollection, generateId } = require('../config/db');

const COLLECTION = 'projects';

// ─── PAGINATION HELPER ────────────────────────────────────────────────────────
function paginate(array, page, limit) {
  const p = Math.max(1, parseInt(page)  || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit) || 10));
  const total = array.length;
  const totalPages = Math.ceil(total / l);
  const items = array.slice((p - 1) * l, p * l);
  return { items, total, page: p, limit: l, totalPages };
}

// ─── GET ALL ──────────────────────────────────────────────────────────────────
/**
 * GET /api/projects
 * Public. Returns active projects sorted by order.
 * Query params: ?page=1  ?limit=10
 */
async function getAll(req, res, next) {
  try {
    let projects = await readCollection(COLLECTION);
    projects = projects
      .filter(p => p.active !== false)
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

    const { items, total, page, limit, totalPages } = paginate(projects, req.query.page, req.query.limit);
    res.json({ data: items, total, page, limit, totalPages });
  } catch (err) {
    next(err);
  }
}

// ─── GET ONE ──────────────────────────────────────────────────────────────────
/**
 * GET /api/projects/:id
 * Public.
 */
async function getOne(req, res, next) {
  try {
    const projects = await readCollection(COLLECTION);
    const project = projects.find(p => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found.' });
    res.json(project);
  } catch (err) {
    next(err);
  }
}

// ─── CREATE ───────────────────────────────────────────────────────────────────
/**
 * POST /api/projects   [PROTECTED]
 * Body: { title, tag, summary, image, link, active, order }
 */
async function create(req, res, next) {
  try {
    const {
      title,
      tag     = '',
      summary = '',
      image   = '',
      link    = '',
      active  = true,
      order,
    } = req.body;

    if (!title) return res.status(400).json({ error: 'title is required.' });

    const projects = await readCollection(COLLECTION);
    const newProject = {
      id:        generateId(),
      title:     String(title).trim(),
      tag:       String(tag).trim(),
      summary:   String(summary).trim(),
      image:     String(image).trim(),
      link:      String(link).trim(),
      active,
      order:     order != null ? order : projects.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    projects.push(newProject);
    await writeCollection(COLLECTION, projects);
    res.status(201).json(newProject);
  } catch (err) {
    next(err);
  }
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────
/**
 * PUT /api/projects/:id   [PROTECTED]
 */
async function update(req, res, next) {
  try {
    const projects = await readCollection(COLLECTION);
    const index = projects.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Project not found.' });

    const allowedFields = ['title', 'tag', 'summary', 'image', 'link', 'active', 'order'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) projects[index][field] = req.body[field];
    });
    projects[index].updatedAt = new Date().toISOString();

    await writeCollection(COLLECTION, projects);
    res.json(projects[index]);
  } catch (err) {
    next(err);
  }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
/**
 * DELETE /api/projects/:id   [PROTECTED]
 */
async function remove(req, res, next) {
  try {
    const projects = await readCollection(COLLECTION);
    const filtered = projects.filter(p => p.id !== req.params.id);
    if (filtered.length === projects.length) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    await writeCollection(COLLECTION, filtered);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getOne, create, update, remove };
