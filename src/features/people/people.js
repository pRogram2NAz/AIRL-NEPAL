/* ==========================================================
   AIRL Nepal – Dynamic Team Rendering & Search
   Fetches from backend API, falls back to people.json seed.
   API response shape: { data: [...], total, page, totalPages }
   ========================================================== */

const API_BASE = 'https://airl-nepal.com.np';

// Resolve root-relative image paths when falling back to local JSON.
// From src/features/people/, the project root is 3 levels up.
const resolveImagePath = (src) => {
  if (!src) return src;
  if (src.startsWith('http') || src.startsWith('//')) return src;
  if (src.startsWith('public/')) return '../../../' + src;
  return src;
};

// Handle both API shape { data: [...] } and plain array (local seed fallback).
const extractItems = (res) => Array.isArray(res) ? res : (res.data || []);

document.addEventListener('DOMContentLoaded', () => {
  const teamGrid   = document.getElementById('teamGrid');
  const teamSearch = document.getElementById('teamSearch');
  const noResults  = document.getElementById('noResults');

  let allMembers = [];

  // ── Render ───────────────────────────────────────────────
  const renderMembers = (members) => {
    if (!teamGrid) return;
    teamGrid.innerHTML = '';

    if (!members.length) {
      noResults?.classList.remove('hidden');
      return;
    }
    noResults?.classList.add('hidden');

    members.forEach(member => {
      const card = document.createElement('div');
      card.className = 'member-card fade-up';
      card.innerHTML = `
        <img src="${resolveImagePath(member.image)}" alt="${member.name}" class="member-photo"
             onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'300\' viewBox=\'0 0 300 300\'%3E%3Crect width=\'300\' height=\'300\' fill=\'%23e8f5e9\'/%3E%3Ccircle cx=\'150\' cy=\'110\' r=\'50\' fill=\'%23a5d6a7\'/%3E%3Cellipse cx=\'150\' cy=\'230\' rx=\'80\' ry=\'60\' fill=\'%23a5d6a7\'/%3E%3Ctext x=\'150\' y=\'285\' text-anchor=\'middle\' font-size=\'13\' fill=\'%232e7d32\' font-family=\'sans-serif\'%3ENo photo%3C/text%3E%3C/svg%3E';" />
        <div class="member-info">
          <h3 class="member-name">${member.name}</h3>
          <p class="member-role">${member.role}</p>
          <p class="member-bio">${member.bio}</p>
        </div>
      `;
      teamGrid.appendChild(card);
    });
  };

  // ── Fetch: API first, fall back to local seed ────────────
  fetch(`${API_BASE}/api/people`)
    .then(res => {
      if (!res.ok) throw new Error('API unavailable');
      return res.json();
    })
    .then(res => {
      allMembers = extractItems(res);
      renderMembers(allMembers);
    })
    .catch(() => {
      fetch('people.json')
        .then(res => res.json())
        .then(res => {
          allMembers = extractItems(res);
          renderMembers(allMembers);
        })
        .catch(() => renderMembers([]));
    });

  // ── Live search ──────────────────────────────────────────
  teamSearch?.addEventListener('input', e => {
    const query = e.target.value.toLowerCase().trim();
    const filtered = allMembers.filter(m =>
      m.name.toLowerCase().includes(query) ||
      m.role.toLowerCase().includes(query) ||
      (m.bio || '').toLowerCase().includes(query)
    );
    renderMembers(filtered);
  });
});
