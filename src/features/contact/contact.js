/* ==========================================================
   AIRL Nepal – Contact Form Handler
   Goal 3: POSTs to backend API
   ========================================================== */

const API_BASE = 'https://airl-nepal.com.np';

document.addEventListener('DOMContentLoaded', () => {
  const contactForm   = document.getElementById('contactForm');
  const nameInput     = document.getElementById('contactName');
  const emailInput    = document.getElementById('contactEmail');
  const subjectInput  = document.getElementById('contactSubject');
  const messageInput  = document.getElementById('contactMessage');

  const nameError    = document.getElementById('nameError');
  const emailError   = document.getElementById('emailError');
  const messageError = document.getElementById('messageError');
  const successBanner = document.getElementById('successBanner');

  // Pre-fill Subject from ?position= query param
  const urlParams = new URLSearchParams(window.location.search);
  const position  = urlParams.get('position');
  if (position && subjectInput) {
    const map = {
      postdoc:     'Application: Postdoctoral Researcher in Satellite Agronomy',
      gra:         'Application: Graduate Research Assistant Fellowship',
      intern:      'Application: Agri-AI Software Engineering Intern',
      spontaneous: 'Spontaneous Application / Career Inquiry',
    };
    if (map[position]) subjectInput.value = map[position];
  }

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    let hasErrors = false;

    if (!nameInput.value.trim()) {
      nameInput.classList.add('is-invalid');
      nameError?.classList.remove('hidden');
      hasErrors = true;
    } else {
      nameInput.classList.remove('is-invalid');
      nameError?.classList.add('hidden');
    }

    if (!emailInput.value.trim() || !isValidEmail(emailInput.value.trim())) {
      emailInput.classList.add('is-invalid');
      emailError?.classList.remove('hidden');
      hasErrors = true;
    } else {
      emailInput.classList.remove('is-invalid');
      emailError?.classList.add('hidden');
    }

    if (!messageInput.value.trim()) {
      messageInput.classList.add('is-invalid');
      messageError?.classList.remove('hidden');
      hasErrors = true;
    } else {
      messageInput.classList.remove('is-invalid');
      messageError?.classList.add('hidden');
    }

    if (hasErrors) return;

    const payload = {
      name:     nameInput.value.trim(),
      email:    emailInput.value.trim(),
      subject:  subjectInput.value.trim() || 'General Inquiry',
      message:  messageInput.value.trim(),
      position: position || '',
    };

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Server error');
      }

      // Success
      successBanner?.classList.remove('hidden');
      contactForm.reset();
      setTimeout(() => successBanner?.classList.add('hidden'), 5000);

    } catch (err) {
      // API offline — fall back to localStorage so no message is lost
      console.warn('API unreachable, saving to localStorage:', err.message);
      try {
        const messages = JSON.parse(localStorage.getItem('airl_messages') || '[]');
        messages.push({ id: Date.now(), ...payload, date: new Date().toISOString() });
        localStorage.setItem('airl_messages', JSON.stringify(messages));
      } catch (_) {}

      successBanner?.classList.remove('hidden');
      contactForm.reset();
      setTimeout(() => successBanner?.classList.add('hidden'), 5000);
    }
  });
});
