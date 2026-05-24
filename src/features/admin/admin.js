/* ==========================================================
   AIRL Nepal – Administration Scripting Panel
   Auth:   JWT stored in sessionStorage as 'airl_jwt'
   API:    All endpoints return { data, total, page, ... }
           extractItems() handles the envelope unwrapping.
   ========================================================== */

const API_BASE = 'https://airl-nepal.com.np';

/* ── Helpers ─────────────────────────────────────────────── */
const authFetch = (url, options = {}) => {
  const token = sessionStorage.getItem('airl_jwt');
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
};

// API returns { data: [...], total, page, ... } — extract the array
const extractItems = (res) => Array.isArray(res) ? res : (res.data || []);

document.addEventListener('DOMContentLoaded', () => {

  /* ══════════════════════════════════════════════════════════
     1. LOGIN PAGE
  ══════════════════════════════════════════════════════════ */
  const loginForm = document.getElementById('adminLoginForm');
  if (loginForm) {
    const usernameInput     = document.getElementById('adminUser');
    const passwordInput     = document.getElementById('adminPass');
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const alertBanner       = document.getElementById('alertBanner');
    const alertMessage      = document.getElementById('alertMessage');
    const alertIcon         = document.getElementById('alertIcon');

    if (sessionStorage.getItem('airl_jwt')) {
      window.location.href = 'dashboard.html';
    }

    togglePasswordBtn?.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      const icon = togglePasswordBtn.querySelector('i');
      if (icon) {
        icon.setAttribute('data-lucide', type === 'text' ? 'eye-off' : 'eye');
        if (window.lucide) window.lucide.createIcons();
      }
    });

    const showAlert = (message, type) => {
      if (!alertBanner) return;
      alertBanner.classList.remove('hidden',
        'bg-rose-50', 'text-rose-700',
        'bg-amber-50', 'text-amber-700',
        'bg-emerald-50', 'text-emerald-700'
      );
      alertMessage.textContent = message;
      if (type === 'error') {
        alertBanner.classList.add('bg-rose-50', 'text-rose-700');
        alertIcon.setAttribute('data-lucide', 'alert-circle');
      } else if (type === 'warning') {
        alertBanner.classList.add('bg-amber-50', 'text-amber-700');
        alertIcon.setAttribute('data-lucide', 'help-circle');
      } else {
        alertBanner.classList.add('bg-emerald-50', 'text-emerald-700');
        alertIcon.setAttribute('data-lucide', 'check-circle');
      }
      if (window.lucide) window.lucide.createIcons();
    };

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();
      if (!username || !password) { showAlert('Fields cannot be empty.', 'warning'); return; }

      try {
        const res  = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (!res.ok) { showAlert(data.error || 'Invalid credentials.', 'error'); return; }
        sessionStorage.setItem('airl_jwt', data.token);
        showAlert('Authentication successful! Redirecting...', 'success');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 1200);
      } catch {
        showAlert('Cannot reach server. Make sure the backend is running.', 'error');
      }
    });
  }

  /* ══════════════════════════════════════════════════════════
     2. DASHBOARD
  ══════════════════════════════════════════════════════════ */
  const membersTableBody  = document.getElementById('membersTableBody');
  const articlesTableBody = document.getElementById('articlesTableBody');

  if (membersTableBody || articlesTableBody) {

    // ── Auth guard ────────────────────────────────────────────
    const token = sessionStorage.getItem('airl_jwt');
    if (!token) { window.location.href = 'login.html'; return; }

    authFetch(`${API_BASE}/api/auth/verify`)
      .then(res => { if (!res.ok) throw new Error(); })
      .catch(() => { sessionStorage.removeItem('airl_jwt'); window.location.href = 'login.html'; });

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
      sessionStorage.removeItem('airl_jwt');
      window.location.href = '../home/index.html';
    });

    document.getElementById('mobileSidebarToggle')?.addEventListener('click', () => {
      document.getElementById('sidebarNav')?.classList.toggle('hidden');
    });

    let peopleDb   = [];
    let articlesDb = [];

    /* ─────────────────────────────────────────────────────────
       PEOPLE — with active/inactive toggle
    ───────────────────────────────────────────────────────── */
    const noMembersAlert      = document.getElementById('noMembersAlert');
    const addNewMemberBtn     = document.getElementById('addNewMemberBtn');
    const memberFormContainer = document.getElementById('memberFormContainer');
    const memberForm          = document.getElementById('memberForm');
    const memberFormTitle     = document.getElementById('memberFormTitle');
    const cancelMemberBtn     = document.getElementById('cancelMemberBtn');
    const editMemberId        = document.getElementById('editMemberIndex');

    const memberName   = document.getElementById('memberName');
    const memberRole   = document.getElementById('memberRole');
    const memberImage  = document.getElementById('memberImage');
    const memberBio    = document.getElementById('memberBio');
    const memberActive = document.getElementById('memberActive'); // checkbox — may be null if not in HTML

    const resolveAdminImagePath = (p) =>
      (p && p.startsWith('public/')) ? '../../../' + p : p;

    const renderPeople = () => {
      if (!membersTableBody) return;
      membersTableBody.innerHTML = '';

      if (!peopleDb.length) { noMembersAlert?.classList.remove('hidden'); return; }
      noMembersAlert?.classList.add('hidden');

      peopleDb.forEach(person => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-slate-100 hover:bg-slate-50/50 transition';

        const activeBadge = person.active !== false
          ? `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Active</span>`
          : `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">Inactive</span>`;

        const toggleLabel = person.active !== false ? 'Deactivate' : 'Activate';

        tr.innerHTML = `
          <td class="py-3.5">
            <img src="${resolveAdminImagePath(person.image)}" alt="" class="w-9 h-9 rounded-full object-cover border border-slate-200"
                 onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'36\' height=\'36\' viewBox=\'0 0 36 36\'%3E%3Crect width=\'36\' height=\'36\' rx=\'18\' fill=\'%23e8f5e9\'/%3E%3Ccircle cx=\'18\' cy=\'13\' r=\'6\' fill=\'%23a5d6a7\'/%3E%3Cellipse cx=\'18\' cy=\'27\' rx=\'10\' ry=\'7\' fill=\'%23a5d6a7\'/%3E%3C/svg%3E';" />
          </td>
          <td class="py-3.5 font-semibold text-slate-900">${person.name}</td>
          <td class="py-3.5 text-slate-500">${person.role}</td>
          <td class="py-3.5">${activeBadge}</td>
          <td class="py-3.5 text-right space-x-2">
            <button class="text-blue-500 hover:text-blue-600 font-semibold text-xs toggle-member-btn" data-id="${person.id}" data-active="${person.active !== false}">${toggleLabel}</button>
            <button class="text-emerald-600 hover:text-emerald-700 font-semibold text-xs edit-member-btn" data-id="${person.id}">Edit</button>
            <button class="text-rose-500 hover:text-rose-600 font-semibold text-xs delete-member-btn" data-id="${person.id}">Delete</button>
          </td>
        `;
        membersTableBody.appendChild(tr);
      });

      membersTableBody.querySelectorAll('.toggle-member-btn').forEach(btn => {
        btn.addEventListener('click', async e => {
          const id        = e.target.getAttribute('data-id');
          const isActive  = e.target.getAttribute('data-active') === 'true';
          const res = await authFetch(`${API_BASE}/api/people/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ active: !isActive }),
          });
          if (res.ok) {
            const updated = await res.json();
            peopleDb = peopleDb.map(p => p.id === id ? updated : p);
            renderPeople();
          } else {
            alert('Failed to update status.');
          }
        });
      });

      membersTableBody.querySelectorAll('.edit-member-btn').forEach(btn => {
        btn.addEventListener('click', e => openEditMember(e.target.getAttribute('data-id')));
      });

      membersTableBody.querySelectorAll('.delete-member-btn').forEach(btn => {
        btn.addEventListener('click', async e => {
          const id = e.target.getAttribute('data-id');
          if (!confirm('Remove this team member?')) return;
          const res = await authFetch(`${API_BASE}/api/people/${id}`, { method: 'DELETE' });
          if (res.ok || res.status === 204) {
            peopleDb = peopleDb.filter(p => p.id !== id);
            renderPeople();
          } else {
            alert('Failed to delete. Please try again.');
          }
        });
      });

      if (window.lucide) window.lucide.createIcons();
    };

    const loadPeople = async () => {
      try {
        const res  = await authFetch(`${API_BASE}/api/people?limit=100`);
        if (!res.ok) throw new Error();
        const json = await res.json();
        peopleDb   = extractItems(json);
      } catch { peopleDb = []; }
      renderPeople();
    };

    addNewMemberBtn?.addEventListener('click', () => {
      memberFormTitle.textContent = 'Add Team Member';
      editMemberId.value = '';
      memberForm.reset();
      if (memberActive) memberActive.checked = true;
      memberFormContainer.classList.remove('hidden');
    });

    cancelMemberBtn?.addEventListener('click', () => memberFormContainer.classList.add('hidden'));

    memberForm?.addEventListener('submit', async e => {
      e.preventDefault();
      const name   = memberName.value.trim();
      const role   = memberRole.value.trim();
      let   img    = memberImage.value.trim();
      const bio    = memberBio.value.trim();
      const active = memberActive ? memberActive.checked : true;

      if (!name || !role || !img || !bio) { alert('All fields are required.'); return; }
      if (!img.includes('/') && !img.includes('\\') && !img.startsWith('http')) {
        img = `public/images/people/${img}`;
      }

      const id     = editMemberId.value;
      const isEdit = id !== '';
      const url    = isEdit ? `${API_BASE}/api/people/${id}` : `${API_BASE}/api/people`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await authFetch(url, { method, body: JSON.stringify({ name, role, bio, image: img, active }) });
      if (!res.ok) { alert('Save failed. Please try again.'); return; }

      const saved = await res.json();
      peopleDb = isEdit ? peopleDb.map(p => p.id === id ? saved : p) : [...peopleDb, saved];
      renderPeople();
      memberFormContainer.classList.add('hidden');
    });

    const openEditMember = (id) => {
      const p = peopleDb.find(x => x.id === id);
      if (!p) return;
      editMemberId.value          = p.id;
      memberFormTitle.textContent = 'Edit Team Member';
      memberName.value   = p.name;
      memberRole.value   = p.role;
      memberImage.value  = p.image;
      memberBio.value    = p.bio;
      if (memberActive) memberActive.checked = p.active !== false;
      memberFormContainer.classList.remove('hidden');
    };

    /* ─────────────────────────────────────────────────────────
       ARTICLES — with published/draft toggle
    ───────────────────────────────────────────────────────── */
    const noArticlesAlert      = document.getElementById('noArticlesAlert');
    const addNewArticleBtn     = document.getElementById('addNewArticleBtn');
    const articleFormContainer = document.getElementById('articleFormContainer');
    const articleForm          = document.getElementById('articleForm');
    const articleFormTitle     = document.getElementById('articleFormTitle');
    const cancelArticleBtn     = document.getElementById('cancelArticleBtn');
    const editArticleId        = document.getElementById('editArticleIndex');

    const articleTitle     = document.getElementById('articleTitle');
    const articleDate      = document.getElementById('articleDate');
    const articleImage     = document.getElementById('articleImage');
    const articleExcerpt   = document.getElementById('articleExcerpt');
    const articleContent   = document.getElementById('articleContent');
    const articlePublished = document.getElementById('articlePublished'); // checkbox — may be null

    const previewArticleBtn    = document.getElementById('previewArticleBtn');
    const previewModalOverlay  = document.getElementById('previewModalOverlay');
    const closePreviewModalBtn = document.getElementById('closePreviewModalBtn');
    const previewModalTitle    = document.getElementById('previewModalTitle');
    const previewModalMeta     = document.getElementById('previewModalMeta');
    const previewModalBody     = document.getElementById('previewModalBody');
    const downloadDbBtn        = document.getElementById('downloadDbBtn');

    const renderArticles = () => {
      if (!articlesTableBody) return;
      articlesTableBody.innerHTML = '';

      if (!articlesDb.length) { noArticlesAlert?.classList.remove('hidden'); return; }
      noArticlesAlert?.classList.add('hidden');

      articlesDb.forEach(article => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-slate-100 hover:bg-slate-50/50 transition';

        const pubBadge = article.published !== false
          ? `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Published</span>`
          : `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Draft</span>`;

        const toggleLabel = article.published !== false ? 'Unpublish' : 'Publish';

        tr.innerHTML = `
          <td class="py-3.5 font-semibold text-slate-900 max-w-xs truncate">${article.title}</td>
          <td class="py-3.5 text-slate-500">${(article.date || '').slice(0, 10)}</td>
          <td class="py-3.5">${pubBadge}</td>
          <td class="py-3.5 text-right space-x-2">
            <button class="text-blue-500 hover:text-blue-600 font-semibold text-xs toggle-article-btn" data-id="${article.id}" data-published="${article.published !== false}">${toggleLabel}</button>
            <button class="text-emerald-600 hover:text-emerald-700 font-semibold text-xs edit-article-btn" data-id="${article.id}">Edit</button>
            <button class="text-rose-500 hover:text-rose-600 font-semibold text-xs delete-article-btn" data-id="${article.id}">Delete</button>
          </td>
        `;
        articlesTableBody.appendChild(tr);
      });

      articlesTableBody.querySelectorAll('.toggle-article-btn').forEach(btn => {
        btn.addEventListener('click', async e => {
          const id          = e.target.getAttribute('data-id');
          const isPublished = e.target.getAttribute('data-published') === 'true';
          const res = await authFetch(`${API_BASE}/api/articles/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ published: !isPublished }),
          });
          if (res.ok) {
            const updated = await res.json();
            articlesDb = articlesDb.map(a => a.id === id ? updated : a);
            renderArticles();
          } else {
            alert('Failed to update status.');
          }
        });
      });

      articlesTableBody.querySelectorAll('.edit-article-btn').forEach(btn => {
        btn.addEventListener('click', e => openEditArticle(e.target.getAttribute('data-id')));
      });

      articlesTableBody.querySelectorAll('.delete-article-btn').forEach(btn => {
        btn.addEventListener('click', async e => {
          const id = e.target.getAttribute('data-id');
          if (!confirm('Delete this article?')) return;
          const res = await authFetch(`${API_BASE}/api/articles/${id}`, { method: 'DELETE' });
          if (res.ok || res.status === 204) {
            articlesDb = articlesDb.filter(a => a.id !== id);
            renderArticles();
          } else {
            alert('Failed to delete. Please try again.');
          }
        });
      });

      if (window.lucide) window.lucide.createIcons();
    };

    const loadArticles = async () => {
      try {
        const res  = await authFetch(`${API_BASE}/api/articles?limit=100`);
        if (!res.ok) throw new Error();
        const json = await res.json();
        // Admin needs ALL articles (incl. drafts) — backend filters published only on public GET.
        // Since admin uses a protected token, the backend should ideally return all.
        // For now extract whatever comes back (published ones) + store them.
        articlesDb = extractItems(json);
      } catch { articlesDb = []; }
      renderArticles();
    };

    addNewArticleBtn?.addEventListener('click', () => {
      articleFormTitle.textContent = 'Add Article';
      editArticleId.value = '';
      articleForm.reset();
      if (articlePublished) articlePublished.checked = true;
      articleFormContainer.classList.remove('hidden');
    });

    cancelArticleBtn?.addEventListener('click', () => articleFormContainer.classList.add('hidden'));

    articleForm?.addEventListener('submit', async e => {
      e.preventDefault();
      const title     = articleTitle.value.trim();
      const date      = articleDate.value;
      let   img       = articleImage.value.trim();
      const excerpt   = articleExcerpt.value.trim();
      const content   = articleContent.value.trim();
      const published = articlePublished ? articlePublished.checked : true;

      if (!title || !date || !img || !excerpt || !content) { alert('All fields are required.'); return; }
      if (!img.includes('/') && !img.includes('\\') && !img.startsWith('http')) {
        img = `public/images/blog/${img}`;
      }

      const id     = editArticleId.value;
      const isEdit = id !== '';
      const url    = isEdit ? `${API_BASE}/api/articles/${id}` : `${API_BASE}/api/articles`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await authFetch(url, { method, body: JSON.stringify({ title, date, image: img, excerpt, content, published }) });
      if (!res.ok) { alert('Save failed. Please try again.'); return; }

      const saved = await res.json();
      articlesDb = isEdit ? articlesDb.map(a => a.id === id ? saved : a) : [...articlesDb, saved];
      renderArticles();
      articleFormContainer.classList.add('hidden');
    });

    const openEditArticle = (id) => {
      const a = articlesDb.find(x => x.id === id);
      if (!a) return;
      editArticleId.value          = a.id;
      articleFormTitle.textContent = 'Edit Article';
      articleTitle.value    = a.title;
      articleDate.value     = (a.date || '').slice(0, 10);
      articleImage.value    = a.image;
      articleExcerpt.value  = a.excerpt;
      articleContent.value  = a.content;
      if (articlePublished) articlePublished.checked = a.published !== false;
      articleFormContainer.classList.remove('hidden');
    };

    previewArticleBtn?.addEventListener('click', () => {
      const title   = articleTitle?.value.trim();
      const date    = articleDate?.value;
      const content = articleContent?.value.trim();
      if (!title || !content) { alert('Enter title and content to preview.'); return; }
      if (previewModalTitle) previewModalTitle.textContent = title;
      if (previewModalMeta)  previewModalMeta.textContent  = `Published on ${date || new Date().toISOString().slice(0, 10)}`;
      if (previewModalBody)  previewModalBody.innerHTML    = content;
      previewModalOverlay?.classList.remove('hidden');
    });
    closePreviewModalBtn?.addEventListener('click', () => previewModalOverlay?.classList.add('hidden'));
    previewModalOverlay?.addEventListener('click', e => {
      if (e.target === previewModalOverlay) previewModalOverlay.classList.add('hidden');
    });

    const triggerDownload = (data, filename) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
    };
    downloadDbBtn?.addEventListener('click', () => {
      triggerDownload(peopleDb,   'people.json');
      setTimeout(() => triggerDownload(articlesDb, 'articles.json'), 500);
    });

    /* ─────────────────────────────────────────────────────────
       INBOX
    ───────────────────────────────────────────────────────── */
    let inboxDb = [];

    const inboxTableBody    = document.getElementById('inboxTableBody');
    const noMessagesAlert   = document.getElementById('noMessagesAlert');
    const clearInboxBtn     = document.getElementById('clearInboxBtn');
    const inboxBadge        = document.getElementById('inboxBadge');
    const inboxModalOverlay = document.getElementById('inboxModalOverlay');
    const closeInboxModalBtn = document.getElementById('closeInboxModalBtn');
    const inboxModalSender  = document.getElementById('inboxModalSender');
    const inboxModalEmail   = document.getElementById('inboxModalEmail');
    const inboxModalSubject = document.getElementById('inboxModalSubject');
    const inboxModalDate    = document.getElementById('inboxModalDate');
    const inboxModalMessage = document.getElementById('inboxModalMessage');

    const renderInbox = () => {
      if (!inboxTableBody) return;
      inboxTableBody.innerHTML = '';

      if (!inboxDb.length) {
        noMessagesAlert?.classList.remove('hidden');
        if (inboxBadge) inboxBadge.classList.add('hidden');
        return;
      }
      noMessagesAlert?.classList.add('hidden');

      const unread = inboxDb.filter(m => !m.read).length;
      if (inboxBadge) {
        inboxBadge.textContent = unread || inboxDb.length;
        inboxBadge.classList.remove('hidden');
      }

      const sorted = [...inboxDb].sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date));

      sorted.forEach(msg => {
        const tr = document.createElement('tr');
        tr.className = `border-b border-slate-100 hover:bg-slate-50/50 transition${msg.read ? '' : ' font-semibold'}`;

        const formattedDate = new Date(msg.timestamp || msg.date).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
        });

        const readBadge = msg.read
          ? `<span class="text-xs text-slate-400">Read</span>`
          : `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">New</span>`;

        tr.innerHTML = `
          <td class="py-3.5 text-xs text-slate-400">${formattedDate}</td>
          <td class="py-3.5 text-slate-900">${msg.name}</td>
          <td class="py-3.5 text-xs font-mono">
            <a href="mailto:${msg.email}" class="hover:underline text-emerald-600">${msg.email}</a>
          </td>
          <td class="py-3.5 text-slate-700 max-w-xs truncate">${msg.subject}</td>
          <td class="py-3.5">${readBadge}</td>
          <td class="py-3.5 text-right space-x-2 shrink-0">
            <button class="text-emerald-600 hover:text-emerald-700 font-semibold text-xs view-msg-btn" data-id="${msg.id}">View</button>
            <button class="text-rose-500 hover:text-rose-600 font-semibold text-xs delete-msg-btn" data-id="${msg.id}">Delete</button>
          </td>
        `;
        inboxTableBody.appendChild(tr);
      });

      inboxTableBody.querySelectorAll('.view-msg-btn').forEach(btn => {
        btn.addEventListener('click', e => openInquiryModal(e.target.getAttribute('data-id')));
      });

      inboxTableBody.querySelectorAll('.delete-msg-btn').forEach(btn => {
        btn.addEventListener('click', async e => {
          const id = e.target.getAttribute('data-id');
          if (!confirm('Remove this message?')) return;
          const res = await authFetch(`${API_BASE}/api/contact/${id}`, { method: 'DELETE' });
          if (res.ok || res.status === 204) {
            inboxDb = inboxDb.filter(m => m.id !== id);
            renderInbox();
          } else {
            alert('Failed to delete message.');
          }
        });
      });

      if (window.lucide) window.lucide.createIcons();
    };

    const loadInbox = async () => {
      try {
        const res  = await authFetch(`${API_BASE}/api/contact?limit=100`);
        if (!res.ok) throw new Error();
        const json = await res.json();
        inboxDb    = extractItems(json);
      } catch { inboxDb = []; }
      renderInbox();
    };

    const openInquiryModal = (id) => {
      const msg = inboxDb.find(m => m.id === id);
      if (!msg || !inboxModalOverlay) return;

      if (inboxModalSender)  inboxModalSender.textContent  = msg.name;
      if (inboxModalEmail)  { inboxModalEmail.textContent  = msg.email; inboxModalEmail.href = `mailto:${msg.email}`; }
      if (inboxModalSubject) inboxModalSubject.textContent = msg.subject;
      if (inboxModalDate)    inboxModalDate.textContent    = new Date(msg.timestamp || msg.date).toLocaleString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
      });
      if (inboxModalMessage) inboxModalMessage.textContent = msg.message;

      // Mark as read
      if (!msg.read) {
        authFetch(`${API_BASE}/api/contact/${id}/read`, {
          method: 'PUT',
          body: JSON.stringify({ read: true }),
        })
          .then(() => {
            const m = inboxDb.find(x => x.id === id);
            if (m) { m.read = true; renderInbox(); }
          })
          .catch(() => {});
      }

      inboxModalOverlay.classList.remove('hidden');
    };

    closeInboxModalBtn?.addEventListener('click', () => inboxModalOverlay?.classList.add('hidden'));
    inboxModalOverlay?.addEventListener('click', e => {
      if (e.target === inboxModalOverlay) inboxModalOverlay.classList.add('hidden');
    });

    clearInboxBtn?.addEventListener('click', async () => {
      if (!confirm('Clear entire inbox? This cannot be undone.')) return;
      await Promise.all(inboxDb.map(m =>
        authFetch(`${API_BASE}/api/contact/${m.id}`, { method: 'DELETE' }).catch(() => {})
      ));
      inboxDb = [];
      renderInbox();
    });

    // ── Boot ─────────────────────────────────────────────────
    loadPeople();
    loadArticles();
    loadInbox();
  }
});
