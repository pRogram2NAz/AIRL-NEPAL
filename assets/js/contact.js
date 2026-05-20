/* ==========================================================
   AIRL Nepal – Contact Form Handler
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  const nameInput = document.getElementById('contactName');
  const emailInput = document.getElementById('contactEmail');
  const subjectInput = document.getElementById('contactSubject');
  const messageInput = document.getElementById('contactMessage');

  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const messageError = document.getElementById('messageError');
  const successBanner = document.getElementById('successBanner');

  // Pre-fill Subject based on query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const position = urlParams.get('position');
  if (position && subjectInput) {
    if (position === 'postdoc') {
      subjectInput.value = "Application: Postdoctoral Researcher in Satellite Agronomy";
    } else if (position === 'gra') {
      subjectInput.value = "Application: Graduate Research Assistant Fellowship";
    } else if (position === 'intern') {
      subjectInput.value = "Application: Agri-AI Software Engineering Intern";
    } else if (position === 'spontaneous') {
      subjectInput.value = "Spontaneous Application / Career Inquiry";
    }
  }

  // Simple email verification regex
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    let hasErrors = false;

    // Validate Name
    if (!nameInput.value.trim()) {
      nameInput.classList.add('is-invalid');
      nameError?.classList.remove('hidden');
      hasErrors = true;
    } else {
      nameInput.classList.remove('is-invalid');
      nameError?.classList.add('hidden');
    }

    // Validate Email
    if (!emailInput.value.trim() || !isValidEmail(emailInput.value.trim())) {
      emailInput.classList.add('is-invalid');
      emailError?.classList.remove('hidden');
      hasErrors = true;
    } else {
      emailInput.classList.remove('is-invalid');
      emailError?.classList.add('hidden');
    }

    // Validate Message
    if (!messageInput.value.trim()) {
      messageInput.classList.add('is-invalid');
      messageError?.classList.remove('hidden');
      hasErrors = true;
    } else {
      messageInput.classList.remove('is-invalid');
      messageError?.classList.add('hidden');
    }

    if (hasErrors) return;

    // Capture visitor inquiry and save to local inbox store (localStorage)
    try {
      const messages = JSON.parse(localStorage.getItem('airl_messages') || '[]');
      const newInquiry = {
        id: Date.now(),
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        subject: subjectInput.value.trim() || "General Inquiry",
        message: messageInput.value.trim(),
        date: new Date().toISOString()
      };
      messages.push(newInquiry);
      localStorage.setItem('airl_messages', JSON.stringify(messages));
    } catch (err) {
      console.warn("Could not save inquiry to local storage:", err);
    }

    // Dynamic Mock success execution
    successBanner?.classList.remove('hidden');
    contactForm.reset();

    // Fade out success banner after 5 seconds
    setTimeout(() => {
      successBanner?.classList.add('hidden');
    }, 5000);
  });
});
