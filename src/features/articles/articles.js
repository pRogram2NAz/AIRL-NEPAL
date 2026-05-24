/* ==========================================================
   AIRL Nepal – Articles Rendering
   Fetches from backend API, falls back to articles.json seed.
   API response shape: { data: [...], total, page, totalPages }
   ========================================================== */

const API_BASE = 'https://airl-nepal.com.np';

document.addEventListener('DOMContentLoaded', () => {
  const articlesGrid = document.getElementById('articlesGrid');
  const noArticles   = document.getElementById('noArticles');

  // ── Render ───────────────────────────────────────────────
  const renderArticles = (articles) => {
    if (!articlesGrid) return;
    articlesGrid.innerHTML = '';

    if (!articles.length) {
      noArticles?.classList.remove('hidden');
      return;
    }
    noArticles?.classList.add('hidden');

    articles.forEach((article, idx) => {
      const card = document.createElement('article');
      card.className = 'article-card fade-up';

      const formattedDate = new Date(article.date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      });

      card.innerHTML = `
        <img src="${article.image}" alt="${article.title}" class="article-img"
             onerror="this.src='https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=400&auto=format&fit=crop';" />
        <div class="article-body">
          <p class="article-meta">
            <i data-lucide="calendar" style="width:12px;height:12px;display:inline;vertical-align:middle;margin-right:4px;"></i>
            ${formattedDate}
          </p>
          <h3 class="article-title">${article.title}</h3>
          <p class="article-excerpt">${article.excerpt}</p>
          <button class="btn btn-primary btn-sm read-article-btn" data-index="${idx}">Read Article</button>
        </div>
      `;
      articlesGrid.appendChild(card);
    });

    articlesGrid.querySelectorAll('.read-article-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        openArticleModal(articles[idx]);
      });
    });

    if (window.lucide) window.lucide.createIcons();
  };

  // ── Modal ────────────────────────────────────────────────
  const openArticleModal = (article) => {
    let dialog = document.getElementById('articleModal');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'articleModal';
      dialog.style.cssText = 'border:none;border-radius:var(--radius-lg);box-shadow:var(--shadow-lg);max-width:720px;width:90%;padding:0;outline:none;';
      dialog.innerHTML = `
        <div style="position:relative;">
          <img id="modalImg" src="" alt="" style="width:100%;height:260px;object-fit:cover;" />
          <button id="modalCloseBtn" style="position:absolute;top:1rem;right:1rem;background:rgba(0,0,0,0.6);color:#fff;width:36px;height:36px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.2rem;">&times;</button>
        </div>
        <div style="padding:2rem;">
          <p id="modalMeta" style="font-size:0.8rem;color:var(--clr-muted);margin-bottom:0.5rem;"></p>
          <h2 id="modalTitle" style="color:var(--clr-primary-dark);font-weight:800;margin-bottom:1.25rem;"></h2>
          <div id="modalBody" style="line-height:1.7;font-size:0.95rem;color:var(--clr-text);"></div>
        </div>
      `;
      document.body.appendChild(dialog);
      dialog.querySelector('#modalCloseBtn').addEventListener('click', () => dialog.close());
      dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
    }

    dialog.querySelector('#modalImg').src             = article.image || '';
    dialog.querySelector('#modalMeta').textContent    = `Published on ${new Date(article.date).toLocaleDateString()}`;
    dialog.querySelector('#modalTitle').textContent   = article.title;
    dialog.querySelector('#modalBody').innerHTML      = article.content; // already sanitized server-side
    dialog.showModal();
  };

  // ── Fetch: API first, fall back to local seed ────────────
  // API returns { data: [...], total, page, totalPages }
  // Fallback seed returns a plain array — handle both shapes.
  const extractItems = (res) => Array.isArray(res) ? res : (res.data || []);

  fetch(`${API_BASE}/api/articles`)
    .then(res => {
      if (!res.ok) throw new Error('API unavailable');
      return res.json();
    })
    .then(res => renderArticles(extractItems(res)))
    .catch(() => {
      fetch('articles.json')
        .then(res => res.json())
        .then(res => renderArticles(extractItems(res)))
        .catch(() => renderArticles([]));
    });
});
