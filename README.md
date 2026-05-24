# 🌱 AIRL Nepal — Agri-Intelligence Research Lab Website

A full-stack research lab website for the **Agri-Intelligence Research Lab (AIRL) Nepal**, Pokhara. Features a vanilla HTML/CSS/JS frontend with a Node.js + Express backend using JSON file storage.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML5 + CSS3 + JavaScript (no framework) |
| Backend | Node.js + Express.js |
| Database | JSON files (`backend/data/`) — swappable to MongoDB |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Icons | Lucide Icons (CDN) |
| Fonts | Inter (Google Fonts) |

---

## 📁 Project Structure

```
AIRL-Nepal/
│
├── index.html                        ← Root redirect → src/features/home/index.html
├── README.md
├── Map_Claude.md                     ← Internal project map for Claude sessions
│
├── src/
│   ├── features/
│   │   ├── home/         index.html, main.js
│   │   ├── about/        about.html
│   │   ├── people/       people.html, people.js, people.json (seed)
│   │   ├── projects/     projects.html, projects.js, projects.json (seed)
│   │   ├── articles/     articles.html, articles.js, articles.json (seed)
│   │   ├── publications/ publications.html (static)
│   │   ├── opportunities/ opportunities.html (static)
│   │   ├── contact/      contact.html, contact.js
│   │   ├── telemetry/    telemetry.js
│   │   ├── diagnostics/  diagnostics.js
│   │   └── admin/        login.html, dashboard.html, admin.js
│   └── shared/
│       └── css/style.css             ← Single global stylesheet
│
├── public/
│   └── images/
│       ├── home.jpg
│       ├── people/   (lalit.jpg, rupak.jpeg)
│       └── blog/     (empty — add blog images here)
│
└── backend/
    ├── server.js                     ← Express app entry point (port 5000)
    ├── .env.example                  ← Copy to .env and fill in values
    ├── generate-hash.js              ← Utility to hash your admin password
    ├── seed.js                       ← One-time data import from src/ JSONs
    ├── config/
    │   └── db.js                     ← JSON file DB helpers
    ├── middleware/
    │   └── auth.js                   ← JWT verify middleware
    ├── controllers/
    │   ├── authController.js
    │   ├── peopleController.js
    │   ├── articlesController.js
    │   ├── contactController.js
    │   └── projectsController.js
    ├── routes/
    │   ├── auth.js
    │   ├── people.js
    │   ├── articles.js
    │   ├── contact.js
    │   └── projects.js
    └── data/                         ← Live JSON database (created by seed.js)
        ├── people.json
        ├── articles.json
        ├── projects.json
        └── messages.json
```

---

## 🚀 Backend Setup (First Time)

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Generate your admin password hash

```bash
node generate-hash.js yourChosenPassword
```

Copy the hash output — you'll need it in the next step.

### 3. Create `.env` from the example

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```env
PORT=5000
JWT_SECRET=some_very_long_random_string_here
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<paste hash from step 2>
CORS_ORIGIN=http://localhost:5500
NODE_ENV=development
```

### 4. Seed the database

```bash
node seed.js
```

This copies data from `src/features/*/**.json` into `backend/data/` with proper IDs.

### 5. Start the backend

```bash
npm run dev
```

Backend runs at **http://localhost:5000**. Verify with:

```
GET http://localhost:5000/api/health
→ { "status": "ok", ... }
```

---

## 🌐 Running the Frontend

The frontend makes `fetch` calls to the backend API, with fallback to local JSON seeds.
Open it with a local static server (browsers block `file://` fetches):

**Option A — VS Code Live Server**
Right-click `index.html` → Open with Live Server (default port 5500).

**Option B — Python**
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000`.

**Option C — Node / npx**
```bash
npx serve .
```

---

## 🔑 Admin Panel

1. Go to `src/features/admin/login.html`
2. Log in with the username/password you set in `.env`
3. Dashboard features:
   - **Manage Team** — Add, edit, delete people via `/api/people`
   - **Manage Articles** — Full CRUD via `/api/articles`, with HTML preview
   - **View Inbox** — Read/mark messages from `/api/contact`

---

## 📡 API Reference

All endpoints run on `http://localhost:5000`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | — | Server status |
| POST | `/api/auth/login` | — | Login → `{token, expiresIn}` |
| GET | `/api/auth/verify` | ✅ | Verify token |
| GET | `/api/people` | — | List team members |
| POST | `/api/people` | ✅ | Add member |
| PUT | `/api/people/:id` | ✅ | Update member |
| DELETE | `/api/people/:id` | ✅ | Delete member |
| GET | `/api/articles` | — | List articles (`?tag=`) |
| POST | `/api/articles` | ✅ | Add article |
| PUT | `/api/articles/:id` | ✅ | Update article |
| DELETE | `/api/articles/:id` | ✅ | Delete article |
| POST | `/api/contact` | — | Submit contact message |
| GET | `/api/contact` | ✅ | List messages |
| PUT | `/api/contact/:id/read` | ✅ | Mark as read |
| DELETE | `/api/contact/:id` | ✅ | Delete message |
| GET | `/api/projects` | — | List projects |
| GET | `/api/projects/:id` | — | Single project |
| POST | `/api/projects` | ✅ | Add project |
| PUT | `/api/projects/:id` | ✅ | Update project |
| DELETE | `/api/projects/:id` | ✅ | Delete project |

Protected routes require: `Authorization: Bearer <token>`

---

## 🖼️ Adding Images

- **People photos** → `public/images/people/<filename.jpg>`
  In `people.json` or the admin form, use just the filename (e.g. `sita.jpg`). The frontend resolves the full path automatically.
- **Blog/article images** → `public/images/blog/<filename.jpg>` or any Unsplash URL.
- **Project images** → Unsplash URLs recommended (no local files needed).

---

## ⚠️ Known Issues / Roadmap

See `Map_Claude.md` for the full issue tracker. Key items:

- CORS is currently restricted to `CORS_ORIGIN` in `.env` — update before deployment
- Login endpoint has no rate limiting yet (brute-force risk)
- No pagination on GET endpoints
- No admin CRUD UI for Projects yet

---

## 📄 License

Research and educational use. Contact AIRL Nepal for collaboration inquiries.
**✉️ info@airl.org.np | 📍 Pokhara, Nepal**
