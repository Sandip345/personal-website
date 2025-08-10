// app.js — mobile nav toggle + scrollspy

document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('.nav-links');
  const links = [...document.querySelectorAll('.nav-links a[href^="#"]')];

  // Mobile nav toggle
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      nav.classList.toggle('active');
    });

    // Close menu after clicking a link (mobile)
    links.forEach(a => a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      nav.classList.remove('active');
    }));
  }

  // Scrollspy
  const sections = links
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  const activate = (id) => {
    links.forEach(a => {
      const on = a.getAttribute('href') === `#${id}`;
      a.classList.toggle('active', on);
      a.setAttribute('aria-current', on ? 'true' : 'false');
    });
  };

  // Use IntersectionObserver for performance
  const io = new IntersectionObserver((entries) => {
    // Pick the most visible section
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) activate(visible.target.id);
  }, { rootMargin: '-20% 0px -60% 0px', threshold: [0.1, 0.5, 1] });

  sections.forEach(sec => io.observe(sec));

  // Fallback: on load, set active based on hash or top section
  const initial = location.hash?.slice(1) || (sections[0] && sections[0].id);
  if (initial) activate(initial);

  // Footer year (also done elsewhere, harmless duplicate)
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
});
