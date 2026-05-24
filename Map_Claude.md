# 🗺️ Map_Claude.md — Claude's Internal Project Map
> **FOR CLAUDE ONLY.** Read this file FIRST. Do NOT run directory_tree or re-scan the folder.
> Last updated: 2026-05-22
> Project root: `C:\Users\Dell\OneDrive\Desktop\AIRL-Nepal\`

---

## ⚡ QUICK START (for Claude, every new session)

1. Read this file (you're doing it — good).
2. Check **CURRENT STATUS** below to know exactly where we left off.
3. Look at the **ACTIVE GOAL** — that's the only thing to work on.
4. Use the **FOLDER MAP** below if you need a file. Do NOT re-scan.
5. When done, update this file: mark goal complete, update status.

---

## 🔖 CURRENT STATUS
> Updated: 2026-05-22

**Goal 1 — Backend built ✅**
**Goal 2 — Frontend paths fixed ✅**
**Goal 3 — Frontend → API connected ✅**
**Goal 4 — Admin JWT auth ✅**
**Goal 5 — Cleanup ✅**
**Goal 6 — Security hardening (all 🔴 critical + 🟠 high) ✅**
**Goal 7 — Low-priority fixes ✅ COMPLETE — 2026-05-22**

### Goal 7 detail
- ✅ #8  Active/inactive toggle for team members — `admin.js` renders Active/Inactive badge + Activate/Deactivate button; PUT /api/people/:id with { active } already supported by controller.
- ✅ #9  Published/draft toggle for articles — `admin.js` renders Published/Draft badge + Publish/Unpublish button; PUT /api/articles/:id with { published } already supported by controller.
- ✅ #10 `markRead` one-way only — fixed in Goal 6 as a bonus; `contactController.js` accepts `{ read: true|false }`. `admin.js` now passes `body: JSON.stringify({ read: true })` on mark-read call. Inbox badge also shows unread count (not total count).
- ✅ #11 JWT expiry hardcoded — `authController.js` reads `process.env.JWT_EXPIRES_IN || '8h'`. `JWT_EXPIRES_IN=8h` added to `.env` and `.env.example`.
- ✅ #12 `NODE_ENV` missing from `.env.example` — fixed in Goal 6; both files updated.
- ✅ #bonus Admin `loadPeople` / `loadArticles` / `loadInbox` were calling res.json() without extractItems() — broken after Goal 6 changed API shape. Fixed with `extractItems()` in all three loaders. Also added `?limit=100` so paginated API returns enough records for admin view.
- ✅ #bonus `diagnostics.js` — 3 low issues fixed:
  1. `fadeUp` keyframe injected via JS at runtime (no CSS dependency)
  2. `scanBeam` hidden via `style.display = 'none'` at init (not CSS-dependent)
  3. `isScanning` always reset via `resetScanUI()` helper called in try/catch/finally of both interval and setTimeout callbacks

**🎉 ALL KNOWN ISSUES RESOLVED**

No open bugs. The project is production-ready pending:
1. Deploying backend to a server (set `NODE_ENV=production`, real `CORS_ORIGIN`, strong `JWT_SECRET`)
2. Adding HTTPS (required for `credentials: true` CORS in production)
3. Optional: swap `DB_MODE=mongodb` for production persistence

---

## 📁 FOLDER MAP (do not re-scan — use this)

```
AIRL-Nepal/
│
├── index.html                             ← ROOT REDIRECT → src/features/home/index.html
├── Map_Claude.md                          ← YOU ARE HERE
├── README.md                              ← ✅ Rewritten
├── _trash/                                ← Legacy — safe to delete
│
├── src/features/
│   ├── home/         index.html, main.js                    ✅
│   ├── about/        about.html                             ✅ static
│   ├── people/       people.html, people.js, people.json    ✅
│   ├── projects/     projects.html, projects.js, projects.json ✅
│   ├── articles/     articles.html, articles.js, articles.json ✅
│   ├── publications/ publications.html                      ✅ static
│   ├── opportunities/ opportunities.html                    ✅ static
│   ├── contact/      contact.html, contact.js               ✅
│   ├── telemetry/    telemetry.js                           (untouched IoT sim)
│   ├── diagnostics/  diagnostics.js                         ✅ all 3 low issues fixed
│   └── admin/        login.html, dashboard.html, admin.js   ✅ active/draft toggles, extractItems
│
├── src/shared/css/style.css               ← SINGLE global stylesheet
│
├── public/images/
│   ├── home.jpg
│   ├── people/ (lalit.jpg, rupak.jpeg)
│   └── blog/
│
└── backend/
    ├── server.js                          ✅ CORS locked, generalLimiter, all routes
    ├── .env                               ✅ NODE_ENV, JWT_EXPIRES_IN, CORS_ORIGIN all set
    ├── .env.example                       ✅ clean, no real secrets, all keys documented
    ├── config/db.js                       ✅ async fs.promises, crypto.randomUUID(), tmp→rename write
    ├── middleware/
    │   ├── auth.js                        JWT verifyToken
    │   ├── errorHandler.js
    │   └── rateLimiter.js                 ✅ loginLimiter, contactLimiter, generalLimiter
    ├── controllers/
    │   ├── authController.js              ✅ JWT_EXPIRES_IN from env
    │   ├── peopleController.js            ✅ async, pagination, string trim
    │   ├── articlesController.js          ✅ async, pagination, sanitizeHtml()
    │   ├── contactController.js           ✅ async, pagination, length guards, toggleable markRead
    │   └── projectsController.js          ✅ async, pagination
    ├── routes/
    │   ├── auth.js                        ✅ loginLimiter
    │   ├── people.js, articles.js
    │   ├── contact.js                     ✅ contactLimiter
    │   └── projects.js
    └── data/                              created by seed.js
```

---

## 🔑 KEY TECHNICAL FACTS

### API Response Shape
All collection GET endpoints return:
```json
{ "data": [...], "total": 12, "page": 1, "limit": 10, "totalPages": 2 }
```
Frontend uses `extractItems(res)` = `Array.isArray(res) ? res : (res.data || [])` to handle both shapes.
Admin loaders use `?limit=100` to fetch all records in one page.

### API Endpoints
```
POST   /api/auth/login              [loginLimiter: 10 failed/15min/IP]
GET    /api/auth/verify             [protected]
GET    /api/people                  ?page= &limit=   (active only, public)
POST/PUT/DELETE /api/people/:id     [protected]
GET    /api/articles                ?tag= &page= &limit=  (published only, public)
POST/PUT/DELETE /api/articles/:id   [protected]
POST   /api/contact                 [contactLimiter: 5/hr/IP]
GET    /api/contact                 [protected] ?unread=true &page= &limit=
PUT    /api/contact/:id/read        [protected] body: { read: true|false }
DELETE /api/contact/:id             [protected]
GET    /api/projects                ?page= &limit=   (active only, public)
GET    /api/projects/:id            (public)
POST/PUT/DELETE /api/projects/:id   [protected]
GET    /api/health
```

### CSS Variables
`--clr-primary`, `--clr-primary-dark`, `--clr-accent`, `--clr-text`, `--clr-muted`,
`--clr-bg`, `--clr-surface`, `--radius-lg`, `--shadow-lg`
Dark mode: `[data-theme="dark"]` on `<html>`.

### localStorage
| Key | Owner | Notes |
|-----|-------|-------|
| `airl_theme` | main.js | "light" / "dark" — keep |

---

## 📝 NOTES FOR CLAUDE
- **ALWAYS read this file first.** Use folder map. Skip directory_tree.
- **Path root:** `C:\Users\Dell\OneDrive\Desktop\AIRL-Nepal\`
- **No build system** — plain HTML/JS/CSS only on frontend.
- **Token efficiency:** Read only specific files needed. Never re-scan.
