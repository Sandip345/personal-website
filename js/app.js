// app.js — populate homepage from content.js + nav toggle + scrollspy + dark mode
// Safe on all pages. Wrapped with guards so a single error won't blank the site.

document.addEventListener('DOMContentLoaded', () => {
  safeRun(tryPopulateHero);
  safeRun(tryRenderAbout);
  safeRun(tryRenderEducation);
  safeRun(tryRenderExperience);
  safeRun(tryRenderProjects); // single-column rows with full description
  safeRun(tryRenderSkills);
  safeRun(tryRenderPresentations); 
  safeRun(tryRenderContact);
  
  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // UI behaviors
  safeRun(setupNavigation);
  safeRun(setupScrollspy);
  safeRun(setupDarkMode);
});

function safeRun(fn) {
  try { fn && fn(); } catch (e) { console.error(fn?.name || 'fn', e); }
}

/* ---------------------- CONTENT RENDERING ---------------------- */

function tryPopulateHero() {
  const C = window.CONTENT;
  if (!C) return;
  const name = document.getElementById('hero-name');
  const tagline = document.getElementById('hero-tagline');
  const desc = document.getElementById('hero-description');
  if (name) name.textContent = C.personal?.name || name.textContent;
  if (tagline) tagline.textContent = C.personal?.tagline || tagline.textContent;
  if (desc) desc.textContent = C.personal?.description || desc.textContent;
}

function tryRenderAbout() {
  const C = window.CONTENT;
  if (!C) return;
  const container = document.getElementById('about-content');
  if (!container) return;
  const paras = Array.isArray(C.about?.paragraphs) ? C.about.paragraphs : [];
  container.innerHTML = '';
  paras.forEach(t => {
    const p = document.createElement('p');
    p.textContent = t;
    container.appendChild(p);
  });
  // Optional CV link
  if (C.personal?.cvLink) {
    const a = document.createElement('a');
    a.href = C.personal.cvLink;
    a.textContent = 'Download CV';
    a.className = 'btn';
    a.style.display = 'inline-block';
    a.style.marginTop = '1rem';
    a.setAttribute('download', '');
    container.appendChild(a);
  }
}

function tryRenderEducation() {
  const C = window.CONTENT;
  if (!C) return;
  const wrap = document.getElementById('education-list');
  if (!wrap) return;
  const items = Array.isArray(C.education) ? C.education : [];
  wrap.innerHTML = '';
  items.forEach(item => wrap.appendChild(buildTimelineItem({
    title: item.degree || '',
    where: item.institution || item.location || '',
    when: item.period || '',
    details: item.details || ''
  })));
}

function tryRenderExperience() {
  const C = window.CONTENT;
  if (!C) return;
  const wrap = document.getElementById('experience-list');
  if (!wrap) return;
  const items = Array.isArray(C.experience) ? C.experience : [];
  wrap.innerHTML = '';
  items.forEach(item => {
    const details = Array.isArray(item.details) ? item.details :
      (item.details ? [item.details] : []);
    wrap.appendChild(buildTimelineItem({
      title: item.title || '',
      where: item.organization || item.location || '',
      when: item.period || '',
      details
    }));
  });
}

function buildTimelineItem({ title, where, when, details }) {
  const div = document.createElement('div');
  div.className = 'timeline-item';

  const h3 = document.createElement('h3');
  h3.textContent = title;
  div.appendChild(h3);

  const period = document.createElement('div');
  period.className = 'timeline-period';
  period.textContent = where ? `${when} • ${where}` : (when || '');
  div.appendChild(period);

  if (details) {
    const box = document.createElement('div');
    box.className = 'details';
    if (Array.isArray(details)) {
      const ul = document.createElement('ul');
      ul.style.listStyle = 'disc';
      ul.style.marginLeft = '1.2rem';
      details.forEach(d => {
        const li = document.createElement('li');
        li.textContent = d;
        ul.appendChild(li);
      });
      box.appendChild(ul);
    } else {
      const p = document.createElement('p');
      p.textContent = details;
      box.appendChild(p);
    }
    div.appendChild(box);
  }
  return div;
}

/* ---------- Projects: single-column rows with FULL description ---------- */
function tryRenderProjects() {
  const C = window.CONTENT;
  const host = document.getElementById('projects-grid');
  if (!C || !host) return;

  const projects = Array.isArray(C.projects) ? C.projects : [];
  console.log('[projects] rendering from app.js, count =', projects.length);

  host.innerHTML = '';
  host.dataset.renderedBy = 'app';

  const slugify = (s) =>
    String(s || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  // show ALL projects (no limit)
  projects.forEach((pj, idx) => {
    const title   = pj.title || pj.name || 'Untitled Project';
    const period  = pj.period || '';
    const fullDesc= pj.longDescription || pj.description || pj.body || '';
    const tagsArr = Array.isArray(pj.tags) ? pj.tags : [];

    const slug = pj.slug || slugify(title);
    const href = pj.link || `project.html?slug=${encodeURIComponent(slug)}`;

    const card = document.createElement('a');
    card.className = 'project-row';
    card.href = href;
    card.setAttribute('aria-label', title);
    card.dataset.index = String(idx);

    const h3 = document.createElement('h3');
    h3.className = 'project-row__title';
    h3.textContent = title;
    card.appendChild(h3);

    if (period) {
      const meta = document.createElement('div');
      meta.className = 'project-row__meta';
      meta.textContent = period;
      card.appendChild(meta);
    }

    if (tagsArr.length) {
      const tags = document.createElement('div');
      tags.className = 'project-row__tags';
      tagsArr.forEach(t => {
        const chip = document.createElement('span');
        chip.className = 'tag';
        chip.textContent = t;
        tags.appendChild(chip);
      });
      card.appendChild(tags);
    }

    if (fullDesc) {
      const p = document.createElement('p');
      p.className = 'project-row__desc';
      p.textContent = fullDesc;         // full text, no truncation
      card.appendChild(p);
    }

    host.appendChild(card);
  });
}



function tryRenderSkills() {
  const C = window.CONTENT;
  if (!C) return;
  const wrap = document.getElementById('skills-content');
  if (!wrap) return;
  const groups = C.skills;
  wrap.innerHTML = '';
  // Accept { languages:[], software:[], ... } or [{title, items}]
  if (Array.isArray(groups)) {
    groups.forEach(g => {
      const div = document.createElement('div');
      div.className = 'skill-group';
      const h3 = document.createElement('h3');
      h3.textContent = g.title || 'Skills';
      div.appendChild(h3);
      const ul = document.createElement('ul');
      (g.items || []).forEach(it => { const li = document.createElement('li'); li.textContent = it; ul.appendChild(li); });
      div.appendChild(ul);
      wrap.appendChild(div);
    });
  } else if (groups && typeof groups === 'object') {
    const map = {
      'Programming': groups.languages,
      'Software': groups.software,
      'Soft Skills': groups.softSkills,
      'Other': groups.other
    };
    Object.entries(map).forEach(([title, items]) => {
      if (!items || !items.length) return;
      const div = document.createElement('div');
      div.className = 'skill-group';
      const h3 = document.createElement('h3');
      h3.textContent = title;
      div.appendChild(h3);
      const ul = document.createElement('ul');
      items.forEach(it => { const li = document.createElement('li'); li.textContent = it; ul.appendChild(li); });
      div.appendChild(ul);
      wrap.appendChild(div);
    });
  }
}

function tryRenderContact() {
  const C = window.CONTENT;
  if (!C) return;
  const list = document.getElementById('contact-list');
  if (!list) return;
  const contacts = Array.isArray(C.personal?.contacts) ? C.personal.contacts : [];
  list.innerHTML = '';
  contacts.forEach(c => {
    const li = document.createElement('li');
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
    links.forEach(a => a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      nav.classList.remove('active');
    }));
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
    // IntersectionObserver unsupported – skip silently
  }
}

function tryRenderPresentations() {
  const C = window.CONTENT;
  const host = document.getElementById('presentations-list');
  if (!C || !host) return;

  const items = Array.isArray(C.presentations) ? C.presentations : [];
  host.innerHTML = '';

  if (!items.length) {
    // nothing to show; hide section
    const sec = document.getElementById('presentations');
    if (sec) sec.style.display = 'none';
    return;
  }

  items.forEach(p => {
    // your content.js uses {title, event, location, date}
    const title = p.title || '';
    const event = p.event || '';
    const location = p.location || '';
    const date = p.date || '';

    const li = document.createElement('li');
    li.className = 'presentation-item';

    const line = [
      title && `<span class="p-title">${title}</span>`,
      event && location ? `<span class="p-where">${event}, ${location}</span>` :
      (event || location) && `<span class="p-where">${event || location}</span>`,
      date && `<span class="p-date">${date}</span>`
    ].filter(Boolean).join(' — ');

    li.innerHTML = line;
    host.appendChild(li);
  });
}


/* ------------------------- DARK MODE ------------------------- */
function setupDarkMode() {
  // Insert button if missing
  let btn = document.getElementById('dark-mode-toggle');
  const header = document.querySelector('header');
  if (!btn && header) {
    btn = document.createElement('button');
    btn.id = 'dark-mode-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Toggle dark mode');
    btn.textContent = '🌙';
    header.appendChild(btn);
  }

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
