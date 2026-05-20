/* ==========================================================
   AIRL Nepal – Projects Rendering
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const projectsGrid = document.getElementById('projectsGrid');
  const noProjects = document.getElementById('noProjects');

  const fallbackProjects = [
    {
      title: "OptiWet: Smart Irrigation Network",
      tag: "IoT & Telemetry",
      image: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?q=80&w=400&auto=format&fit=crop",
      summary: "Deploying low-cost localized telemetry nodes to measure soil moisture and optimize water allocation in rice fields.",
      link: "projects.html#"
    },
    {
      title: "GeoCrop: Satellite Agronomy",
      tag: "Earth Observation",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&auto=format&fit=crop",
      summary: "Processing multi-spectral Sentinel-2 data to build automated NDVI classification and crop prediction engines.",
      link: "projects.html#"
    },
    {
      title: "PestScan Mobile",
      tag: "Deep Learning",
      image: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=400&auto=format&fit=crop",
      summary: "An optimized TensorFlow Lite mobile app that identifies regional crop pests and diseases instantly offline.",
      link: "projects.html#"
    }
  ];

  const renderProjects = (projects) => {
    if (!projectsGrid) return;
    projectsGrid.innerHTML = '';

    if (projects.length === 0) {
      noProjects?.classList.remove('hidden');
      return;
    }
    noProjects?.classList.add('hidden');

    projects.forEach(project => {
      const card = document.createElement('div');
      card.className = 'card fade-up';
      
      card.innerHTML = `
        <img src="${project.image}" alt="${project.title}" class="card-img" onerror="this.src='https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400&auto=format&fit=crop';" />
        <div class="card-body">
          <span class="card-tag">${project.tag}</span>
          <h3 class="card-title">${project.title}</h3>
          <p class="card-text">${project.summary}</p>
          <a href="${project.link}" class="btn btn-primary btn-sm">Learn More <i data-lucide="arrow-right" style="width: 14px; height: 14px;"></i></a>
        </div>
      `;
      
      projectsGrid.appendChild(card);
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  };

  fetch('data/projects.json')
    .then(res => {
      if (!res.ok) throw new Error('Could not load projects.json');
      return res.json();
    })
    .then(data => {
      renderProjects(data);
    })
    .catch(err => {
      console.warn('Using project fallbacks:', err.message);
      renderProjects(fallbackProjects);
    });
});
