/* ==========================================================
   AIRL Nepal – Articles Rendering
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const articlesGrid = document.getElementById('articlesGrid');
  const noArticles = document.getElementById('noArticles');

  const fallbackArticles = [
    {
      title: "How AI Optimizes Water Use in Rice Paddies",
      date: "2026-05-15",
      excerpt: "Analyzing our 6-month trial in Pokhara using telemetry data to reduce crop water requirements by up to 28% without affecting yield quality.",
      image: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?q=80&w=400&auto=format&fit=crop",
      content: "<p>Water resource optimization remains a foundational pillar for smallholder rice farming across Nepal. Traditional irrigation cycles are often dynamic but inefficient, resulting in either excessive runoff or severe water stress.</p><p>Our smart platform utilizes low-cost localized telemetry to track soil saturation parameters and advise farmers on optimal pumping frequency. Initial data points indicate up to a 28% decrease in electricity cost and water volume requirements.</p>"
    },
    {
      title: "Deploying Sentinel Imagery to Fight Blight",
      date: "2026-04-20",
      excerpt: "Scaling remote sensing analytics to provide regional warning systems for late blight in potato farms throughout the Kaski district.",
      image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=400&auto=format&fit=crop",
      content: "<p>Late blight remains one of the most volatile agricultural threats in the Kaski district. Early identification saves up to 90% of local crop yield value.</p><p>By processing Sentinel-2 spectral layers, our GIS software alerts agricultural extensions of potential pathogen hotspots several days before physical symptoms are visible on leaves.</p>"
    }
  ];

  const renderArticles = (articles) => {
    if (!articlesGrid) return;
    articlesGrid.innerHTML = '';

    if (articles.length === 0) {
      noArticles?.classList.remove('hidden');
      return;
    }
    noArticles?.classList.add('hidden');

    articles.forEach((article, idx) => {
      const card = document.createElement('article');
      card.className = 'article-card fade-up';
      
      // Simple date formatting
      const formattedDate = new Date(article.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      card.innerHTML = `
        <img src="${article.image}" alt="${article.title}" class="article-img" onerror="this.src='https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=400&auto=format&fit=crop';" />
        <div class="article-body">
          <p class="article-meta"><i data-lucide="calendar" style="width: 12px; height: 12px; display: inline; vertical-align: middle; margin-right: 4px;"></i> ${formattedDate}</p>
          <h3 class="article-title">${article.title}</h3>
          <p class="article-excerpt">${article.excerpt}</p>
          <button class="btn btn-primary btn-sm read-article-btn" data-index="${idx}">Read Article</button>
        </div>
      `;
      
      articlesGrid.appendChild(card);
    });

    // Handle Article Modal Detail Views
    const readBtns = articlesGrid.querySelectorAll('.read-article-btn');
    readBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = e.target.getAttribute('data-index');
        const article = articles[index];
        openArticleModal(article);
      });
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  };

  // Build a highly premium dynamic overlay modal for reading full articles
  const openArticleModal = (article) => {
    // Check if dialog exists, else create it
    let dialog = document.getElementById('articleModal');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'articleModal';
      dialog.style.border = 'none';
      dialog.style.borderRadius = 'var(--radius-lg)';
      dialog.style.boxShadow = 'var(--shadow-lg)';
      dialog.style.maxWidth = '720px';
      dialog.style.width = '90%';
      dialog.style.padding = '0';
      dialog.style.outline = 'none';
      
      dialog.innerHTML = `
        <div style="position: relative;">
          <img id="modalImg" src="" alt="" style="width: 100%; height: 260px; object-fit: cover;" />
          <button id="modalCloseBtn" style="position: absolute; top: 1rem; right: 1rem; background: rgba(0,0,0,0.6); color: #fff; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">&times;</button>
        </div>
        <div style="padding: 2rem;">
          <p id="modalMeta" style="font-size: 0.8rem; color: var(--clr-muted); margin-bottom: 0.5rem;"></p>
          <h2 id="modalTitle" style="color: var(--clr-primary-dark); font-weight: 800; margin-bottom: 1.25rem;"></h2>
          <div id="modalBody" style="line-height: 1.7; font-size: 0.95rem; color: var(--clr-text);"></div>
        </div>
      `;
      document.body.appendChild(dialog);
      
      dialog.querySelector('#modalCloseBtn').addEventListener('click', () => dialog.close());
    }

    dialog.querySelector('#modalImg').src = article.image;
    dialog.querySelector('#modalMeta').textContent = `Published on ${new Date(article.date).toLocaleDateString()}`;
    dialog.querySelector('#modalTitle').textContent = article.title;
    dialog.querySelector('#modalBody').innerHTML = article.content;

    dialog.showModal();
  };

  // Check local cache first for instant website updates
  const localArticles = localStorage.getItem('airl_articles');
  if (localArticles) {
    const data = JSON.parse(localArticles);
    renderArticles(data);
  } else {
    fetch('data/articles.json')
      .then(res => {
        if (!res.ok) throw new Error('Could not load articles.json');
        return res.json();
      })
      .then(data => {
        localStorage.setItem('airl_articles', JSON.stringify(data));
        renderArticles(data);
      })
      .catch(err => {
        console.warn('Using article fallbacks:', err.message);
        localStorage.setItem('airl_articles', JSON.stringify(fallbackArticles)); // Write to cache so admin dashboard can sync
        renderArticles(fallbackArticles);
      });
  }
});
