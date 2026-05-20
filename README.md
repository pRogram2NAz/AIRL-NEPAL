# Agri-Intelligence Research Lab (AIRL) Nepal Website

A modern, highly professional, completely static website tailored for the **Agri-Intelligence Research Lab (AIRL) Nepal** in Pokhara. The system features dynamic databases loaded via lightweight JSON feeds and an advanced client-side Administration Panel allowing team and blog adjustments.

## 🚀 Key Architectural Features
- **100% Hostable on GitHub Pages:** Zero server side runtime requirements (Node.js, databases, PHP). Works straight out of the box on standard static host platforms.
- **Dynamic Portfolios & Teams:** The team members panel (`people.html`), project gallery (`projects.html`), and blogs index (`articles.html`) are driven by lightweight JSON data stores (`data/*.json`).
- **Advanced Administration Console:** An elegant Tailwind-styled dashboard (`admin/dashboard.html`) featuring secure credentials validation, reactive input validation, output visual modal previews, and down-stream JSON synchronization.
- **Responsive Architecture:** Fully mobile-first custom CSS system with micro-animations.

---

## 📂 Code Directory Layout
```
airl-nepal/
│
├── index.html                   # Home Portal & dynamic highlights
├── about.html                   # Lab details, Mission, and Core Values
├── people.html                  # Dynamic Team listing with instant search filters
├── projects.html                # Dyn-loaded Smart Farming research portfolios
├── articles.html                # news index with dynamic detail popup modals
├── publications.html            # Scholarly output, PDFs, BibTeX links
├── opportunities.html           # Summer internships, PhD fellows, career openings
├── contact.html                 # validations and pre-fill applications query hook
│
├── data/
│   ├── people.json              # Team members dynamic database
│   ├── projects.json            # Research projects dynamic database
│   └── articles.json            # Blog articles database
│
├── assets/
│   ├── css/
│   │   └── style.css            # Global CSS custom properties, grid layouts & resets
│   ├── js/
│   │   ├── main.js              # Header controls and Dynamic Footer setup
│   │   ├── people.js            # Live search & data render loop for team
│   │   ├── projects.js          # Dynamic portfolio engine
│   │   ├── articles.js          # Dynamic blog reader & detail modal controller
│   │   └── contact.js           # Query parameter filler & validated inputs
│
└── admin/
    ├── login.html               # Administration portal authentication entry
    ├── dashboard.html           # Tailwind CRUD manager controls panel
    └── config.js                # Administrator credentials data store
```

---

## 🛠️ Local Development & Running
Because this website makes `fetch` calls to retrieve dynamic JSON databases (`data/*.json`), browsers will block requests if opened straight from a local file explorer (`file://`) due to CORS security rules.

To run locally, execute a simple local web server:

### Option A: Using Python (Simplest)
Open a terminal in the project folder and run:
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000` in your web browser.

### Option B: Using Node.js / NPX
If you have Node.js installed, run:
```bash
npx serve .
```
Then open the provided local URL in your browser.

---

## 🧑‍💻 Operating the Admin Dashboard
The dashboard allows laboratory administrators to manage dynamic content (team members and news items) directly from a user-friendly browser interface without editing code.

1. Navigate to `admin/login.html` (e.g. `http://localhost:8000/admin/login.html`).
2. Log in using the standard credentials:
   - **Username:** `admin`
   - **Password:** `password123`
3. Inside the Dashboard:
   - **Manage Team Members:** Add new entries, update details, or delete current profiles.
   - **Manage Articles:** Form validation keeps entries consistent. Click **Preview** to see how the HTML post renders inside a clean layout mock modal before saving.
   - **Syncing Changes:** Since the dashboard runs on the client-side (static host), it cannot directly overwrite files on disk. Instead, click the **Download Updated JSONs** button at the top right of the dashboard.
   - Replace your local `data/people.json` and `data/articles.json` files with the downloaded ones.
   - Commit and push those changes to your repository!

---

## 🌐 Deployment to GitHub Pages

1. **Create a GitHub Repository:** Upload the contents of this folder directly to a new repository (e.g., `airl-nepal`).
2. **Configure Settings:**
   - Go to your repository **Settings** tab.
   - Under the sidebar menu, click **Pages**.
   - Under **Build and deployment**, select **Deploy from a branch**.
   - Choose your branch (e.g., `main` or `master`) and set the folder to `/ (root)`.
   - Click **Save**.
3. **Enjoy your live site:** In a few moments, GitHub will host your site live at `https://<your-username>.github.io/airl-nepal/`.
