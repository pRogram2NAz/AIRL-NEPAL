/* ==========================================================
   AIRL Nepal – Main Global JS
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. DYNAMIC THEME SWITCHER CONTROLLER ---
  const injectThemeSwitcher = () => {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    // Check if toggle already exists to prevent duplicate injections
    if (document.getElementById('globalThemeToggle')) return;

    // Create list item for theme toggle
    const li = document.createElement('li');
    li.style.display = 'inline-flex';
    li.style.alignItems = 'center';

    // Create theme button
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'globalThemeToggle';
    toggleBtn.className = 'theme-toggle-btn';
    toggleBtn.type = 'button';
    toggleBtn.ariaLabel = 'Toggle theme mode';
    
    // Set initial icon based on current theme state
    const currentTheme = localStorage.getItem('airl_theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    const iconName = currentTheme === 'dark' ? 'sun' : 'moon';
    toggleBtn.innerHTML = `<i data-lucide="${iconName}"></i>`;

    li.appendChild(toggleBtn);
    navLinks.appendChild(li);

    // Dynamic icon creator helper
    if (window.lucide) window.lucide.createIcons();

    // Toggle click listener
    toggleBtn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('airl_theme', newTheme);

      // Transition the button icon
      const newIcon = newTheme === 'dark' ? 'sun' : 'moon';
      toggleBtn.innerHTML = `<i data-lucide="${newIcon}"></i>`;
      if (window.lucide) window.lucide.createIcons();
    });
  };

  // Pre-load theme instantly before transition lag
  const savedTheme = localStorage.getItem('airl_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Mobile navigation menu toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.querySelector('.nav-links');

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navLinks.classList.toggle('is-open');
      
      // Update hamburger icon visual state if needed
      const spans = mobileMenuBtn.querySelectorAll('span');
      if (navLinks.classList.contains('is-open')) {
        spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });

    // Close mobile nav when clicking outside
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('is-open') && !navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        navLinks.classList.remove('is-open');
        const spans = mobileMenuBtn.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });
  }

  // Active page highlights
  const currentPath = window.location.pathname;
  const navAnchors = document.querySelectorAll('.nav-links a');
  navAnchors.forEach(a => {
    const href = a.getAttribute('href');
    if (href && (currentPath.endsWith(href) || (currentPath.endsWith('/') && href === 'index.html'))) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });

  // Footer Dynamic Year
  const currentYearSpan = document.getElementById('current-year');
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // Execute Theme Toggle Injection
  injectThemeSwitcher();

  // --- 2. FAST SCROLL REVEAL INTERSECTION OBSERVER ---
  const initScrollReveal = () => {
    const revealTargets = document.querySelectorAll('.fade-up, .highlight-card, .card, .member-card, .article-card, .opp-card, .pub-item, .telemetry-card');
    
    const observerOptions = {
      root: null,
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target); // Trigger only once
        }
      });
    }, observerOptions);

    revealTargets.forEach(target => {
      target.classList.add('reveal-item');
      observer.observe(target);
    });
  };

  // Wait a small frame for smooth browser rendering
  setTimeout(initScrollReveal, 100);
});
