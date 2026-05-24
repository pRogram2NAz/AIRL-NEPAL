/* ==========================================================
   AIRL Nepal – Projects Rendering
   Fetches from backend API, falls back to projects.json seed.
   API response shape: { data: [...], total, page, totalPages }
   "Learn More" opens a detail modal.
   ========================================================== */

const API_BASE = 'https://airl-nepal.com.np';

// Handle both API shape { data: [...] } and plain array (local seed fallback).
const extractItems = (res) => Array.isArray(res) ? res : (res.data || []);

document.addEventListener('DOMContentLoaded', () => {
  const projectsGrid = document.getElementById('projectsGrid');
  const noProjects   = document.getElementById('noProjects');

  // ── Modal ────────────────────────────────────────────────
  const createModal = () => {
    const modal = document.createElement('dialog');
    modal.id = 'projectModal';
    modal.style.cssText = [
      'border:none',
      'border-radius:var(--radius-lg)',
      'box-shadow:var(--shadow-lg)',
      'max-width:680px',
      'width:90%',
      'padding:0',
      'outline:none',
    ].join(';');

    modal.innerHTML = `
      <div style="position:relative;">
        <img id="projModalImg" src="" alt=""
             style="width:100%;height:240px;object-fit:cover;border-radius:var(--radius-lg) var(--radius-lg) 0 0;" />
        <button id="projModalClose"
          style="position:absolute;top:1rem;right:1rem;background:rgba(0,0,0,0.55);
                 color:#fff;width:36px;height:36px;border-radius:50%;border:none;
                 cursor:pointer;font-size:1.25rem;display:flex;align-items:center;
                 justify-content:center;line-height:1;">&times;</button>
      </div>
      <div style="padding:2rem;">
        <span id="projModalTag" style="
          display:inline-block;font-size:0.72rem;font-weight:700;text-transform:uppercase;
          letter-spacing:0.6px;color:var(--clr-primary);background:hsla(141,50%,92%,0.7);
          border-radius:999px;padding:0.2rem 0.7rem;margin-bottom:0.85rem;"></span>
        <h2 id="projModalTitle"
            style="color:var(--clr-primary-dark);font-weight:800;font-size:1.35rem;
                   margin-bottom:1rem;line-height:1.3;"></h2>
        <p id="projModalSummary"
           style="color:var(--clr-text);line-height:1.7;font-size:0.95rem;"></p>
      </div>
    `;

    document.body.appendChild(modal);
    modal.querySelector('#projModalClose').addEventListener('click', () => modal.close());
    modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });
    return modal;
  };

  const modal = createModal();

  const openModal = (project) => {
    modal.querySelector('#projModalImg').src              = project.image || '';
    modal.querySelector('#projModalImg').alt              = project.title;
    modal.querySelector('#projModalTag').textContent      = project.tag || '';
    modal.querySelector('#projModalTitle').textContent    = project.title;
    modal.querySelector('#projModalSummary').textContent  = project.summary || project.description || '';
    modal.showModal();
  };

  // ── Render ───────────────────────────────────────────────
  const renderProjects = (projects) => {
    if (!projectsGrid) return;
    projectsGrid.innerHTML = '';

    if (!projects.length) {
      noProjects?.classList.remove('hidden');
      return;
    }
    noProjects?.classList.add('hidden');

    projects.forEach(project => {
      const card = document.createElement('div');
      card.className = 'card fade-up';

      card.innerHTML = `
        <img src="${project.image}" alt="${project.title}" class="card-img"
             onerror="this.src='https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400&auto=format&fit=crop';" />
        <div class="card-body">
          <span class="card-tag">${project.tag || ''}</span>
          <h3 class="card-title">${project.title}</h3>
          <p class="card-text">${project.summary || project.description || ''}</p>
          <button class="btn btn-primary btn-sm learn-more-btn">
            Learn More <i data-lucide="arrow-right" style="width:14px;height:14px;"></i>
          </button>
        </div>
      `;

      card.querySelector('.learn-more-btn').addEventListener('click', () => openModal(project));
      projectsGrid.appendChild(card);
    });

    if (window.lucide) window.lucide.createIcons();
  };

  // ── Fetch: API first, fall back to local seed ────────────
  fetch(`${API_BASE}/api/projects`)
    .then(res => {
      if (!res.ok) throw new Error('API unavailable');
      return res.json();
    })
    .then(res => renderProjects(extractItems(res)))
    .catch(() => {
      fetch('projects.json')
        .then(res => {
          if (!res.ok) throw new Error('projects.json unavailable');
          return res.json();
        })
        .then(res => renderProjects(extractItems(res)))
        .catch(() => renderProjects([]));
    });
});
