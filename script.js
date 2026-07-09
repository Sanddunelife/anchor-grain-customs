// Anchor Grain Customs — basic interactivity

document.addEventListener('DOMContentLoaded', () => {

  // ---------- Footer year ----------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Mobile nav toggle ----------
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---------- Testimonial carousel ----------
  const track = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dotsContainer = document.getElementById('carousel-dots');

  if (track && prevBtn && nextBtn && dotsContainer) {
    const slides = Array.from(track.children);
    let current = 0;
    let autoplayTimer = null;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.classList.add('carousel-dot');
      dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });

    const dots = Array.from(dotsContainer.children);

    function update() {
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
    }

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      update();
      restartAutoplay();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function restartAutoplay() {
      if (autoplayTimer) clearInterval(autoplayTimer);
      autoplayTimer = setInterval(next, 6000);
    }

    nextBtn.addEventListener('click', next);
    prevBtn.addEventListener('click', prev);

    update();
    restartAutoplay();
  }

  // ---------- Contact form ----------
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');

  if (form && status) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();

      if (!name || !email || !message) {
        status.textContent = 'Please fill out every field before sending.';
        status.style.color = '#b3401f';
        return;
      }

      // No backend yet — simulate a successful send.
      status.textContent = `Thanks, ${name}! Your message has been received — we'll be in touch soon.`;
      status.style.color = '#1d4270';
      form.reset();
    });
  }

});
