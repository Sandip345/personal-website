// app.js — populate sections from content.js + nav toggle + scrollspy + dark mode + footer year
// Safe on all pages (guards for missing elements & data)

document.addEventListener('DOMContentLoaded', () => {
  // ===== Content population (homepage) =====
  tryPopulateHero();
  tryRenderAbout();
  tryRenderEducation();
  tryRenderExperience();
  tryRenderProjects();   // only if CONTENT.projects exists (else projects-api.js can handle)
  tryRenderSkills();
  tryRenderContact();

  // ===== Footer year =====
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== Mobile nav toggle =====
  setupNavigation();

  // ===== Scrollspy (only if in-page anchor nav exists) =====
  setupScrollspy();

  // ===== Dark mode (auto-insert button if missing) =====
  setupDarkMode();
});

/* ---------------------- POPULATE HELPERS ---------------------- */

function tryPopulateHero() {
  if (!window.CONTENT) return;
  const name = document.getElementById('hero-name');
  const tagline = document.getElementById('hero-tagline');
  const desc = document.getElementById('hero-description');
  if (name && CONTENT.personal?.name) name.textContent = CONTENT.personal.name;
  if (tagline && CONTENT.personal?.tagline) tagline.textContent = CONTENT.personal.tagline;
  if (desc && CONTENT.personal?.description) desc.textContent = CONTENT.personal.description;
}

function tryRenderAbout() {
  if (!window.CONTENT) return;
  const container = document.getElementById('about-content');
  if (!container || !Array.isArray(CONTENT.about?.paragraphs)) return;
  container.innerHTML = '';
  CONTENT.about.paragraphs.forEach(t => {
    const p = document.createElement('p');
    p.textContent = t;
    p.style.marginBottom = '1rem';
    container.appendChild(p);
  });

  // Optional CV link
  if (CONTENT.personal?.cvLink) {
    const a = document.createElement('a');
    a.href = CONTENT.personal.cvLink;
    a.textContent = 'Download CV';
    a.className = 'btn';
    a.style.display = 'inline-block';
    a.style.marginTop = '1rem';
    a.setAttribute('download', 'Sandip_Gautam_CV.pdf');
    container.appendChild(a);
  }
}

function tryRenderEducation() {
  if (!window.CONTENT) return;
  const wrap = document.getElementById('education-list');
  if (!wrap || !Array.isArray(CONTENT.education)) return;
  wrap.innerHTML = '';
  CONTENT.education.forEach(item => {
    wrap.appendChild(buildTimelineItem(item, true));
  });
}

function tryRenderExperience() {
  if (!window.CONTENT) return;
  const wrap = document.getElementById('experience-list');
  if (!wrap || !Array.isArray(CONTENT.experience)) return;
  wrap.innerHTML = '';
  CONTENT.experience.forEach(item => {
    wrap.appendChild(buildTimelineItem(item, false));
  });
}

function buildTimelineItem(item, isEducation) {
  const div = document.createElement('div');
  div.className = 'timeline-item';

  const h3 = document.createElement('h3');
  h3.textContent = isEducation ? (item.degree || '') : (item.title || '');
  div.appendChild(h3);

  const period = document.createElement('div');
  period.className = 'timeline-period';
  const where = isEducation ? (item.location || '') : (item.location || '');
  const when = item.period || '';
  period.textContent = where ? `${when} • ${where}` : when;
  div.appendChild(period);

  const subtitle = document.createElement('div');
  subtitle.style.fontStyle = 'italic';
  subtitle.style.color = 'var(--color-text)';
  subtitle.style.marginBottom = '0.5rem';
  subtitle.textContent = isEducation ? (item.institution || '') : (item.organization || '');
  if (subtitle.textContent) div.appendChild(subtitle);

  const details = document.createElement('div');
  details.className = 'details';
  if (isEducation) {
    if (item.details) {
      const p = document.createElement('p');
      p.textContent = item.details;
      details.appendChild(p);
    }
  } else {
    if (Array.isArray(item.details)) {
      const ul = document.createElement('ul');
      ul.style.listStyle = 'disc';
      ul.style.marginLeft = '1.2rem';
      ul.style.fontSize = '0.95rem';
      item.details.forEach(d => {
        const li = document.createElement('li');
        li.style.marginBottom = '0.3rem';
        li.textContent = d;
        ul.appendChild(li);
      });
      details.appendChild(ul);
    } else if (typeof item.details === 'string') {
      const p = document.createElement('p');
      p.textContent = item.details;
      details.appendChild(p);
    }
  }
  if (details.childNodes.length) div.appendChild(details);
  return div;
}

function tryRenderProjects() {
  // If CONTENT.projects exists, render; else leave to projects-api.js (which fetches from repo)
  if (!window.CONTENT || !Array.isArray(CONTENT.projects)) return;
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  grid.innerHTML = '';

  CONTENT.projects.forEach(pj => {
    const card = document.createElement('div');
    card.className = 'project-card';

    if (pj.image) {
      const img = document.createElement('img');
      img.src = pj.image;
      img.alt = pj.title || 'Project image';
      card.appendChild(img);
    }

    const content = document.createElement('div');
    content.className = 'card-content';

    const h3 = document.createElement('h3');
    h3.textContent = pj.title || 'Untitled Project';
    content.appendChild(h3);

    if (pj.period) {
      const small = document.createElement('div');
      small.className = 'news-meta';
      small.style.marginBottom = '.5rem';
      small.textContent = pj.period;
      content.appendChild(small);
    }

    if (pj.description) {
      const p = document.createElement('p');
      p.textContent = pj.description;
      content.appendChild(p);
    }

    if (Array.isArray(pj.tags) && pj.tags.length) {
      const tags = document.createElement('div');
      tags.className = 'tags';
      pj.tags.forEach(t => {
        const s = document.createElement('span');
        s.textContent = t;
        tags.appendChild(s);
      });
      content.appendChild(tags);
    }

    // Optional link
    if (pj.link) {
      const a = document.createElement('a');
      a.href = pj.link;
      a.className = 'btn';
      a.style.marginTop = '0.75rem';
      a.textContent = 'View';
      a.target = '_blank';
      content.appendChild(a);
    }

    card.appendChild(content);
    grid.appendChild(card);
  });
}

function tryRenderSkills() {
  if (!window.CONTENT) return;
  const wrap = document.getElementById('skills-content');
  if (!wrap || !Array.isArray(CONTENT.skills)) return;
  wrap.innerHTML = '';
  CONTENT.skills.forEach(group => {
    const div = document.createElement('div');
    div.className = 'skill-group';
    const h3 = document.createElement('h3');
    h3.textContent = group.title || '';
    div.appendChild(h3);
    if (Array.isArray(group.items)) {
      const ul = document.createElement('ul');
      group.items.forEach(it => {
        const li = document.createElement('li');
        li.textContent = it;
        ul.appendChild(li);
      });
      div.appendChild(ul);
    }
    wrap.appendChild(div);
  });
}

function tryRenderContact() {
  if (!window.CONTENT) return;
  const list = document.getElementById('contact-list');
  if (!list || !Array.isArray(CONTENT.personal?.contacts)) return;
  list.innerHTML = '';
  CONTENT.personal.contacts.forEach(c => {
    const li = document.createElement('li');
    const spanIcon = document.createElement('span');
    spanIcon.className = 'icon';
    // tiny icon text (can be replaced with real icons later)
    spanIcon.textContent = c.type === 'Email' ? '✉️' : (c.type === 'Phone' ? '📞' : '📍');
    li.appendChild(spanIcon);

    if (c.link) {
      const a = document.createElement('a');
      a.href = c.link;
      a.textContent = c.value;
      a.rel = 'noopener';
      li.appendChild(a);
    } else {
      const span = document.createElement('span');
      span.textContent = c.value;
      li.appendChild(span);
    }
    list.appendChild(li);
  });
}

/* ---------------------- NAV + SCROLLSPY ---------------------- */

function setupNavigation() {
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('.nav-links');
  const links = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));

  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      nav.classList.toggle('active');
    });
    links.forEach(a =>
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        nav.classList.remove('active');
      })
    );
  }
}

function setupScrollspy() {
  const links = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  if (!links.length) return;
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (!sections.length) return;

  const activate = (id) => {
    links.forEach(a => {
      const on = a.getAttribute('href') === `#${id}`;
      a.classList.toggle('active', on);
      a.setAttribute('aria-current', on ? 'true' : 'false');
    });
  };

  try {
    const io = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target?.id) activate(visible.target.id);
    }, { rootMargin: '-20% 0px -60% 0px', threshold: [0.1, 0.5, 1] });

    sections.forEach(sec => io.observe(sec));

    const initial = location.hash?.slice(1) || (sections[0] && sections[0].id);
    if (initial) activate(initial);
  } catch (e) {
    // Older browsers: skip scrollspy silently
    // console.warn('Scrollspy disabled:', e);
  }
}

/* ------------------------- DARK MODE ------------------------- */

function setupDarkMode() {
  // Insert button if missing
  let btn = document.getElementById('dark-mode-toggle');
  const header = document.querySelector('header, .navbar .container, .navbar');
  if (!btn && header) {
    btn = document.createElement('button');
    btn.id = 'dark-mode-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Toggle dark mode');
    btn.textContent = '🌙';
    // place on the right of header/navbar
    if (header.classList.contains('container')) {
      header.appendChild(btn);
    } else if (header.classList.contains('navbar')) {
      header.querySelector('.container')?.appendChild(btn);
    } else {
      header.appendChild(btn);
    }
  }

  // Apply saved preference
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.body.classList.add('dark-mode');
    if (btn) btn.textContent = '☀️';
  }

  if (btn) {
    btn.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const dark = document.body.classList.contains('dark-mode');
      localStorage.setItem('theme', dark ? 'dark' : 'light');
      btn.textContent = dark ? '☀️' : '🌙';
    });
  }
}
