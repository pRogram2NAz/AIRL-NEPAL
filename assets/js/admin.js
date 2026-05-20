/* ==========================================================
   AIRL Nepal – Administration Scripting Panel
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------
  // 1. LOGIN PAGE CONTROLLER (Triggered by presence of form)
  // --------------------------------------------------------
  const loginForm = document.getElementById('adminLoginForm');
  if (loginForm) {
    const usernameInput = document.getElementById('adminUser');
    const passwordInput = document.getElementById('adminPass');
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const alertBanner = document.getElementById('alertBanner');
    const alertMessage = document.getElementById('alertMessage');
    const alertIcon = document.getElementById('alertIcon');

    // Toggle password visibility
    togglePasswordBtn?.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      const icon = togglePasswordBtn.querySelector('i');
      if (icon) {
        if (type === 'text') {
          icon.setAttribute('data-lucide', 'eye-off');
        } else {
          icon.setAttribute('data-lucide', 'eye');
        }
        if (window.lucide) window.lucide.createIcons();
      }
    });

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const user = usernameInput.value.trim();
      const pass = passwordInput.value.trim();

      // Read configurations
      const expectedUser = window.AIRL_CONFIG?.auth?.username || "admin";
      const expectedPass = window.AIRL_CONFIG?.auth?.password || "password123";

      if (!user || !pass) {
        showAlert("Fields cannot be empty.", "warning");
        return;
      }

      if (user === expectedUser && pass === expectedPass) {
        // Safe authenticated state - write to both storage locations for robustness
        sessionStorage.setItem('airl_admin_session', 'authenticated');
        localStorage.setItem('airl_admin_session', 'authenticated');
        showAlert("Authentication successful! Redirecting...", "success");
        setTimeout(() => {
          // Append session query parameter to guarantee file:// sharing of login state
          window.location.href = "dashboard.html?session=authenticated";
        }, 1200);
      } else {
        showAlert("Invalid credentials. Please try again.", "error");
      }
    });

    const showAlert = (message, type) => {
      if (!alertBanner) return;
      alertBanner.classList.remove('hidden', 'bg-rose-50', 'text-rose-700', 'bg-amber-50', 'text-amber-700', 'bg-emerald-50', 'text-emerald-700');
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
  }

  // --------------------------------------------------------
  // 2. DASHBOARD SECURITY GUARD & WORKSPACE CONTROLLER
  // (Triggered by presence of unique dashboard elements)
  // --------------------------------------------------------
  const membersTableBody = document.getElementById('membersTableBody');
  const articlesTableBody = document.getElementById('articlesTableBody');

  if (membersTableBody || articlesTableBody) {
    // Hybrid session receiver - detects redirects from login page and synchronizes storage
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('session') === 'authenticated') {
      sessionStorage.setItem('airl_admin_session', 'authenticated');
      localStorage.setItem('airl_admin_session', 'authenticated');
      // Clean query parameters from address bar to keep a premium neat design
      try {
        const newUrl = window.location.pathname;
        window.history.replaceState({ path: newUrl }, '', newUrl);
      } catch (e) {
        console.warn("Could not clean URL path params:", e);
      }
    }

    const session = sessionStorage.getItem('airl_admin_session') || localStorage.getItem('airl_admin_session');
    if (session !== 'authenticated') {
      window.location.href = "login.html";
      return;
    }

    // Logout trigger - redirect to homepage as requested
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn?.addEventListener('click', () => {
      sessionStorage.removeItem('airl_admin_session');
      localStorage.removeItem('airl_admin_session');
      window.location.href = "../index.html";
    });

    // Mobile sidebar toggle handler
    const sidebarToggle = document.getElementById('mobileSidebarToggle');
    const sidebarNav = document.getElementById('sidebarNav');
    sidebarToggle?.addEventListener('click', () => {
      sidebarNav?.classList.toggle('hidden');
    });

    // --- Dynamic Data Stores ---
    let peopleDb = [];
    let articlesDb = [];

    // Elements team
    const noMembersAlert = document.getElementById('noMembersAlert');
    const addNewMemberBtn = document.getElementById('addNewMemberBtn');
    const memberFormContainer = document.getElementById('memberFormContainer');
    const memberForm = document.getElementById('memberForm');
    const memberFormTitle = document.getElementById('memberFormTitle');
    const cancelMemberBtn = document.getElementById('cancelMemberBtn');
    const editMemberIndex = document.getElementById('editMemberIndex');

    const memberName = document.getElementById('memberName');
    const memberRole = document.getElementById('memberRole');
    const memberImage = document.getElementById('memberImage');
    const memberBio = document.getElementById('memberBio');

    // Elements articles
    const noArticlesAlert = document.getElementById('noArticlesAlert');
    const addNewArticleBtn = document.getElementById('addNewArticleBtn');
    const articleFormContainer = document.getElementById('articleFormContainer');
    const articleForm = document.getElementById('articleForm');
    const articleFormTitle = document.getElementById('articleFormTitle');
    const cancelArticleBtn = document.getElementById('cancelArticleBtn');
    const editArticleIndex = document.getElementById('editArticleIndex');

    const articleTitle = document.getElementById('articleTitle');
    const articleDate = document.getElementById('articleDate');
    const articleImage = document.getElementById('articleImage');
    const articleExcerpt = document.getElementById('articleExcerpt');
    const articleContent = document.getElementById('articleContent');

    const previewArticleBtn = document.getElementById('previewArticleBtn');
    const previewModalOverlay = document.getElementById('previewModalOverlay');
    const closePreviewModalBtn = document.getElementById('closePreviewModalBtn');
    const previewModalTitle = document.getElementById('previewModalTitle');
    const previewModalMeta = document.getElementById('previewModalMeta');
    const previewModalBody = document.getElementById('previewModalBody');

    const downloadDbBtn = document.getElementById('downloadDbBtn');

    // --- Load Initial Databases ---
    const loadDatabases = async () => {
      // Load People (Check LocalStorage first for instant persistence updates)
      const localPeople = localStorage.getItem('airl_people');
      if (localPeople) {
        peopleDb = JSON.parse(localPeople);
        renderPeople();
      } else {
        let loaded = false;
        try {
          const res = await fetch('../data/people.json');
          if (res.ok) {
            peopleDb = await res.json();
            localStorage.setItem('airl_people', JSON.stringify(peopleDb));
            loaded = true;
          }
        } catch (e) {
          console.warn('Initializing local people DB failed via fetch. Falling back to default seeds.');
        }
        
        if (!loaded) {
          // Initialize people fallback list under local file protocol
          peopleDb = [
            {
              "name": "Dr. Sandesh Khanal",
              "role": "Lead Agri-AI Researcher",
              "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
              "bio": "Ph.D. in Smart Agriculture. Specializes in predictive ML models for crop disease forecasting."
            },
            {
              "name": "Anjana Adhikari",
              "role": "Senior GIS Analyst & Remote Sensing Engineer",
              "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop",
              "bio": "M.Sc. in Geoinformatics. Leverages Sentinel data to map crop health indices across Nepal."
            },
            {
              "name": "Bishal Thapa",
              "role": "IoT Systems & Precision Hardware Engineer",
              "image": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop",
              "bio": "Develops low-power soil telemetry hardware and smart drip irrigation nodes for local pilots."
            }
          ];
          localStorage.setItem('airl_people', JSON.stringify(peopleDb));
        }
        renderPeople();
      }

      // Load Articles (Check LocalStorage first)
      const localArticles = localStorage.getItem('airl_articles');
      if (localArticles) {
        articlesDb = JSON.parse(localArticles);
        renderArticles();
      } else {
        let loaded = false;
        try {
          const res = await fetch('../data/articles.json');
          if (res.ok) {
            articlesDb = await res.json();
            localStorage.setItem('airl_articles', JSON.stringify(articlesDb));
            loaded = true;
          }
        } catch (e) {
          console.warn('Initializing local articles DB failed via fetch. Falling back to default seeds.');
        }

        if (!loaded) {
          // Initialize article fallback list under local file protocol
          articlesDb = [
            {
              "title": "How AI Optimizes Water Use in Rice Paddies",
              "date": "2026-05-15",
              "excerpt": "Analyzing our 6-month trial in Pokhara using telemetry data to reduce crop water requirements by up to 28% without affecting yield quality.",
              "image": "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?q=80&w=400&auto=format&fit=crop",
              "content": "<p>Water resource optimization remains a foundational pillar for smallholder rice farming across Nepal. Traditional irrigation cycles are often dynamic but inefficient, resulting in either excessive runoff or severe water stress.</p><p>Our smart platform utilizes low-cost localized telemetry to track soil saturation parameters and advise farmers on optimal pumping frequency. Initial data points indicate up to a 28% decrease in electricity cost and water volume requirements.</p>"
            },
            {
              "title": "Deploying Sentinel Imagery to Fight Blight",
              "date": "2026-04-20",
              "excerpt": "Scaling remote sensing analytics to provide regional warning systems for late blight in potato farms throughout the Kaski district.",
              "image": "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=400&auto=format&fit=crop",
              "content": "<p>Late blight remains one of the most volatile agricultural threats in the Kaski district. Early identification saves up to 90% of local crop yield value.</p><p>By processing Sentinel-2 spectral layers, our GIS software alerts agricultural extensions of potential pathogen hotspots several days before physical symptoms are visible on leaves.</p>"
            }
          ];
          localStorage.setItem('airl_articles', JSON.stringify(articlesDb));
        }
        renderArticles();
      }
    };

    // --- Helper to resolve local image paths inside the admin subdirectory ---
    const resolveAdminImagePath = (path) => {
      if (path && path.startsWith('assets/')) {
        return '../' + path;
      }
      return path;
    };

    // --- PEOPLE CRUD CONTROLLERS ---
    const renderPeople = () => {
      if (!membersTableBody) return;
      membersTableBody.innerHTML = '';
      if (peopleDb.length === 0) {
        noMembersAlert?.classList.remove('hidden');
        return;
      }
      noMembersAlert?.classList.add('hidden');

      peopleDb.forEach((person, idx) => {
        const tr = document.createElement('tr');
        tr.className = "border-b border-slate-100 hover:bg-slate-50/50 transition";
        tr.innerHTML = `
          <td class="py-3.5"><img src="${resolveAdminImagePath(person.image)}" alt="" class="w-9 h-9 rounded-full object-cover border border-slate-200" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop';" /></td>
          <td class="py-3.5 font-semibold text-slate-900">${person.name}</td>
          <td class="py-3.5 text-slate-500">${person.role}</td>
          <td class="py-3.5 text-right space-x-2">
            <button class="text-emerald-600 hover:text-emerald-700 font-semibold text-xs edit-member-btn" data-index="${idx}">Edit</button>
            <button class="text-rose-500 hover:text-rose-600 font-semibold text-xs delete-member-btn" data-index="${idx}">Delete</button>
          </td>
        `;
        membersTableBody.appendChild(tr);
      });

      // Hook events
      membersTableBody.querySelectorAll('.edit-member-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = e.target.getAttribute('data-index');
          openEditMember(index);
        });
      });
      membersTableBody.querySelectorAll('.delete-member-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = e.target.getAttribute('data-index');
          if (confirm("Are you sure you want to remove this team member?")) {
            peopleDb.splice(index, 1);
            localStorage.setItem('airl_people', JSON.stringify(peopleDb)); // Save to localStorage for instant website updates
            renderPeople();
          }
        });
      });
    };

    addNewMemberBtn?.addEventListener('click', () => {
      memberFormTitle.textContent = "Add Team Member";
      editMemberIndex.value = '';
      memberForm.reset();
      memberFormContainer.classList.remove('hidden');
    });

    cancelMemberBtn?.addEventListener('click', () => {
      memberFormContainer.classList.add('hidden');
    });

    memberForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = memberName.value.trim();
      const role = memberRole.value.trim();
      let img = memberImage.value.trim();
      const bio = memberBio.value.trim();

      if (!name || !role || !img || !bio) {
        alert("All fields are required.");
        return;
      }

      // Auto-format plain filenames to assets/images/people/ for simple local repository workflow
      if (!img.includes('/') && !img.includes('\\') && !img.startsWith('http')) {
        img = `assets/images/people/${img}`;
      }

      const item = { name, role, image: img, bio };
      const index = editMemberIndex.value;

      if (index !== '') {
        peopleDb[index] = item;
      } else {
        peopleDb.push(item);
      }

      localStorage.setItem('airl_people', JSON.stringify(peopleDb)); // Update Local Caching
      renderPeople();
      memberFormContainer.classList.add('hidden');
    });

    const openEditMember = (index) => {
      const p = peopleDb[index];
      editMemberIndex.value = index;
      memberFormTitle.textContent = "Edit Team Member";
      
      memberName.value = p.name;
      memberRole.value = p.role;
      memberImage.value = p.image;
      memberBio.value = p.bio;

      memberFormContainer.classList.remove('hidden');
    };

    // --- ARTICLES CRUD CONTROLLERS ---
    const renderArticles = () => {
      if (!articlesTableBody) return;
      articlesTableBody.innerHTML = '';
      if (articlesDb.length === 0) {
        noArticlesAlert?.classList.remove('hidden');
        return;
      }
      noArticlesAlert?.classList.add('hidden');

      articlesDb.forEach((article, idx) => {
        const tr = document.createElement('tr');
        tr.className = "border-b border-slate-100 hover:bg-slate-50/50 transition";
        tr.innerHTML = `
          <td class="py-3.5 font-semibold text-slate-900 max-w-xs truncate">${article.title}</td>
          <td class="py-3.5 text-slate-500">${article.date}</td>
          <td class="py-3.5 text-right space-x-2">
            <button class="text-emerald-600 hover:text-emerald-700 font-semibold text-xs edit-article-btn" data-index="${idx}">Edit</button>
            <button class="text-rose-500 hover:text-rose-600 font-semibold text-xs delete-article-btn" data-index="${idx}">Delete</button>
          </td>
        `;
        articlesTableBody.appendChild(tr);
      });

      // Hook events
      articlesTableBody.querySelectorAll('.edit-article-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = e.target.getAttribute('data-index');
          openEditArticle(index);
        });
      });
      articlesTableBody.querySelectorAll('.delete-article-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = e.target.getAttribute('data-index');
          if (confirm("Are you sure you want to delete this article?")) {
            articlesDb.splice(index, 1);
            localStorage.setItem('airl_articles', JSON.stringify(articlesDb)); // Save to localStorage for instant website updates
            renderArticles();
          }
        });
      });
    };

    addNewArticleBtn?.addEventListener('click', () => {
      articleFormTitle.textContent = "Add Article";
      editArticleIndex.value = '';
      articleForm.reset();
      articleFormContainer.classList.remove('hidden');
    });

    cancelArticleBtn?.addEventListener('click', () => {
      articleFormContainer.classList.add('hidden');
    });

    articleForm?.addEventListener('submit', (e) => {
      e.preventDefault();

      const title = articleTitle.value.trim();
      const date = articleDate.value;
      let img = articleImage.value.trim();
      const excerpt = articleExcerpt.value.trim();
      const content = articleContent.value.trim();

      if (!title || !date || !img || !excerpt || !content) {
        alert("All fields are required.");
        return;
      }

      // Auto-format plain filenames to assets/images/blog/ for simple local repository workflow
      if (!img.includes('/') && !img.includes('\\') && !img.startsWith('http')) {
        img = `assets/images/blog/${img}`;
      }

      const item = { title, date, image: img, excerpt, content };
      const index = editArticleIndex.value;

      if (index !== '') {
        articlesDb[index] = item;
      } else {
        articlesDb.push(item);
      }

      localStorage.setItem('airl_articles', JSON.stringify(articlesDb)); // Update Local Caching
      renderArticles();
      articleFormContainer.classList.add('hidden');
    });

    const openEditArticle = (index) => {
      const a = articlesDb[index];
      editArticleIndex.value = index;
      articleFormTitle.textContent = "Edit Article";

      articleTitle.value = a.title;
      articleDate.value = a.date;
      articleImage.value = a.image;
      articleExcerpt.value = a.excerpt;
      articleContent.value = a.content;

      articleFormContainer.classList.remove('hidden');
    };

    // --- HIGH-FIDELITY PREVIEW MODAL ---
    previewArticleBtn?.addEventListener('click', () => {
      const title = articleTitle.value.trim();
      const date = articleDate.value;
      const content = articleContent.value.trim();

      if (!title || !content) {
        alert("Please enter title and content to generate a preview.");
        return;
      }

      if (previewModalTitle && previewModalMeta && previewModalBody && previewModalOverlay) {
        previewModalTitle.textContent = title;
        previewModalMeta.textContent = `Published on ${date || new Date().toISOString().split('T')[0]}`;
        previewModalBody.innerHTML = content;
        previewModalOverlay.classList.remove('hidden');
      }
    });

    closePreviewModalBtn?.addEventListener('click', () => {
      previewModalOverlay?.classList.add('hidden');
    });

    // --- JSON DOWNLOAD SYNCHRONIZER ---
    const triggerFileDownload = (data, filename) => {
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    };

    downloadDbBtn?.addEventListener('click', () => {
      // Trigger down of both databases consecutively
      triggerFileDownload(peopleDb, "people.json");
      setTimeout(() => {
        triggerFileDownload(articlesDb, "articles.json");
      }, 500);
    });

    // --- DYNAMIC INBOX / INQUIRIES CONTROLLER ---
    let inboxDb = [];
    
    const inboxTableBody = document.getElementById('inboxTableBody');
    const noMessagesAlert = document.getElementById('noMessagesAlert');
    const clearInboxBtn = document.getElementById('clearInboxBtn');
    const inboxBadge = document.getElementById('inboxBadge');

    const inboxModalOverlay = document.getElementById('inboxModalOverlay');
    const closeInboxModalBtn = document.getElementById('closeInboxModalBtn');
    const inboxModalSender = document.getElementById('inboxModalSender');
    const inboxModalEmail = document.getElementById('inboxModalEmail');
    const inboxModalSubject = document.getElementById('inboxModalSubject');
    const inboxModalDate = document.getElementById('inboxModalDate');
    const inboxModalMessage = document.getElementById('inboxModalMessage');

    const loadInbox = () => {
      try {
        const localMessages = localStorage.getItem('airl_messages');
        if (localMessages) {
          inboxDb = JSON.parse(localMessages);
        } else {
          // Initialize some premium seed messages to make the UI look alive and high-fidelity immediately!
          inboxDb = [
            {
              id: 1,
              name: "Prof. Ram Prasad Upadhaya",
              email: "ram.prasad@tribhuvan.edu.np",
              subject: "Inquiry on ML Telemetry Dataset Collaboration",
              message: "Hello AIRL Nepal Team,\n\nI am a researcher at Tribhuvan University, and I was reading your impressive recent article about AI paddy water optimization in Pokhara.\n\nI would love to explore if your team is open to sharing your IoT soil telemetry dataset for scholarly benchmarking purposes or potentially co-authoring a regional agricultural modeling paper.\n\nBest regards,\nRam Prasad Upadhaya\nTribhuvan University",
              date: new Date(Date.now() - 3600000 * 24).toISOString() // 1 day ago
            },
            {
              id: 2,
              name: "Suman Gurung",
              email: "suman.g@gmail.com",
              subject: "Application: Agri-AI Software Engineering Intern",
              message: "Dear Hiring Team,\n\nI am extremely excited to apply for the Agri-Intelligence Software Intern position at AIRL. Currently pursuing my B.Sc. in Computer Science with a focus on Deep Learning, I have developed minor crop leaf disease diagnostic scripts using mobile PyTorch architectures.\n\nI have attached my application and would love to learn if you have any open slots in Pokhara for the upcoming research cycle.\n\nThank you,\nSuman Gurung",
              date: new Date(Date.now() - 3600000 * 6).toISOString() // 6 hours ago
            }
          ];
          localStorage.setItem('airl_messages', JSON.stringify(inboxDb));
        }
      } catch (e) {
        console.warn("Failed to parse local messages, resetting inbox:", e);
        inboxDb = [];
      }
      renderInbox();
    };

    const renderInbox = () => {
      if (!inboxTableBody) return;
      inboxTableBody.innerHTML = '';

      if (inboxDb.length === 0) {
        noMessagesAlert?.classList.remove('hidden');
        if (inboxBadge) inboxBadge.classList.add('hidden');
        return;
      }
      noMessagesAlert?.classList.add('hidden');

      // Update badge count in sidebar
      if (inboxBadge) {
        inboxBadge.textContent = inboxDb.length;
        inboxBadge.classList.remove('hidden');
      }

      // Sort by date desc (most recent first)
      const sortedDb = [...inboxDb].sort((a, b) => new Date(b.date) - new Date(a.date));

      sortedDb.forEach((msg) => {
        const tr = document.createElement('tr');
        tr.className = "border-b border-slate-100 hover:bg-slate-50/50 transition";
        
        const formattedDate = new Date(msg.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        tr.innerHTML = `
          <td class="py-3.5 text-xs text-slate-400 font-semibold">${formattedDate}</td>
          <td class="py-3.5 font-semibold text-slate-900">${msg.name}</td>
          <td class="py-3.5 text-slate-500 text-xs font-mono"><a href="mailto:${msg.email}" class="hover:underline text-emerald-600">${msg.email}</a></td>
          <td class="py-3.5 text-slate-700 max-w-xs truncate">${msg.subject}</td>
          <td class="py-3.5 text-right space-x-2 shrink-0">
            <button class="text-emerald-600 hover:text-emerald-700 font-semibold text-xs view-msg-btn" data-id="${msg.id}">View</button>
            <button class="text-rose-500 hover:text-rose-600 font-semibold text-xs delete-msg-btn" data-id="${msg.id}">Delete</button>
          </td>
        `;
        inboxTableBody.appendChild(tr);
      });

      // Hook view events
      inboxTableBody.querySelectorAll('.view-msg-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = parseInt(e.target.getAttribute('data-id'));
          openInquiryModal(id);
        });
      });

      // Hook delete events
      inboxTableBody.querySelectorAll('.delete-msg-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = parseInt(e.target.getAttribute('data-id'));
          if (confirm("Are you sure you want to remove this message from your inbox?")) {
            inboxDb = inboxDb.filter(m => m.id !== id);
            localStorage.setItem('airl_messages', JSON.stringify(inboxDb));
            renderInbox();
          }
        });
      });
    };

    const openInquiryModal = (id) => {
      const msg = inboxDb.find(m => m.id === id);
      if (!msg) return;

      if (inboxModalOverlay && inboxModalSender && inboxModalEmail && inboxModalSubject && inboxModalDate && inboxModalMessage) {
        inboxModalSender.textContent = msg.name;
        inboxModalEmail.textContent = msg.email;
        inboxModalEmail.href = `mailto:${msg.email}`;
        inboxModalSubject.textContent = msg.subject;
        inboxModalDate.textContent = new Date(msg.date).toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        inboxModalMessage.textContent = msg.message;
        inboxModalOverlay.classList.remove('hidden');
      }
    };

    closeInboxModalBtn?.addEventListener('click', () => {
      inboxModalOverlay?.classList.add('hidden');
    });

    clearInboxBtn?.addEventListener('click', () => {
      if (confirm("Are you sure you want to clear your entire inbox? This cannot be undone.")) {
        inboxDb = [];
        localStorage.setItem('airl_messages', JSON.stringify(inboxDb));
        renderInbox();
      }
    });

    // Initialize Page Controls
    loadDatabases();
    loadInbox();
  }
});
