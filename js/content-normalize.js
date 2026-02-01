// content-normalize.js
// Keeps ALL your existing CONTENT, but normalizes its shape so app.js can render it.
// Safe to run even if your CONTENT is already in the new format.

(function () {
  if (!window.CONTENT || typeof window.CONTENT !== 'object') return;

  const C = window.CONTENT;

  // --- personal ---
  C.personal = C.personal || {};
  C.personal.name = C.personal.name ?? C.name ?? C.fullName ?? '';
  C.personal.tagline = C.personal.tagline ?? C.tagline ?? C.subtitle ?? '';
  C.personal.description = C.personal.description ?? C.bio ?? C.summary ?? '';
  // cv link (leave whatever you had)
  if (C.personal.cvLink == null) C.personal.cvLink = C.cvLink || C.resumeLink || C.cv || '';

  // contacts: accept many shapes and normalize to [{type, value, link}]
  let contacts = C.personal.contacts;
  if (!Array.isArray(contacts)) {
    contacts = [];
    if (C.email || C.personal.email) {
      const val = C.personal.email || C.email;
      contacts.push({ type: 'Email', value: val, link: `mailto:${val}` });
    }
    if (C.phone || C.personal.phone) {
      const val = C.personal.phone || C.phone;
      contacts.push({ type: 'Phone', value: val });
    }
    if (C.location || C.personal.location) {
      const val = C.personal.location || C.location;
      contacts.push({ type: 'Location', value: val });
    }
    if (C.linkedin || C.personal.linkedin) {
      const val = C.personal.linkedin || C.linkedin;
      contacts.push({ type: 'LinkedIn', value: val.replace(/^https?:\/\//, ''), link: /^https?:\/\//.test(val) ? val : `https://${val}` });
    }
    if (C.github || C.personal.github) {
      const val = C.personal.github || C.github;
      contacts.push({ type: 'GitHub', value: val.replace(/^https?:\/\//, ''), link: /^https?:\/\//.test(val) ? val : `https://${val}` });
    }
  }
  C.personal.contacts = contacts;

  // --- about ---
  // Accept about as string, {text}, {paragraphs}, or array of strings
  if (typeof C.about === 'string') {
    C.about = { paragraphs: C.about.split(/\n{2,}/).map(s => s.trim()).filter(Boolean) };
  } else if (Array.isArray(C.about)) {
    C.about = { paragraphs: C.about };
  } else if (C.about && !Array.isArray(C.about.paragraphs)) {
    const p = C.about.text || C.about.paragraph || C.about.content || '';
    C.about.paragraphs = Array.isArray(p) ? p : (typeof p === 'string' ? p.split(/\n{2,}/).map(s => s.trim()).filter(Boolean) : []);
  } else if (!C.about) {
    C.about = { paragraphs: [] };
  }

  // --- education / experience ---
  // Keep arrays as-is; if single object, wrap to array
  if (C.education && !Array.isArray(C.education)) C.education = [C.education];
  if (C.experience && !Array.isArray(C.experience)) C.experience = [C.experience];
  C.education = C.education || [];
  C.experience = C.experience || [];

  // Ensure fields exist (app.js reads these)
  C.education = C.education.map(e => ({
    degree: e.degree ?? e.title ?? '',
    institution: e.institution ?? e.school ?? e.university ?? '',
    period: e.period ?? e.duration ?? '',
    location: e.location ?? '',
    details: e.details ?? e.note ?? ''
  }));
  C.experience = C.experience.map(x => ({
    title: x.title ?? x.role ?? '',
    organization: x.organization ?? x.company ?? '',
    period: x.period ?? x.duration ?? '',
    location: x.location ?? '',
    details: Array.isArray(x.details)
      ? x.details
      : (typeof x.details === 'string' && x.details.includes('•'))
        ? x.details.split('•').map(s => s.trim()).filter(Boolean)
        : (typeof x.details === 'string' ? [x.details] : [])
  }));

  // --- projects (homepage grid optional; projects-api.js can also handle) ---
  if (C.projects && !Array.isArray(C.projects)) C.projects = [C.projects];
  C.projects = C.projects || [];
  C.projects = C.projects.map(p => ({
    title: p.title ?? p.name ?? '',
    period: p.period ?? p.date ?? '',
    description: p.description ?? p.summary ?? '',
    image: p.image ?? p.img ?? '',
    tags: Array.isArray(p.tags) ? p.tags : (typeof p.tags === 'string' ? p.tags.split(',').map(s => s.trim()).filter(Boolean) : []),
    link: p.link ?? p.url ?? p.href ?? ''
  }));

  // --- skills ---
  // New app.js expects: skills = [{ title, items: [] }, ...]
  // Accept old shapes like: skills.languages, skills.software, skills.softSkills, skills.other
  const skills = C.skills;
  let normalizedSkills = [];

  const asGroup = (title, value) => {
    if (!value) return null;
    const items = Array.isArray(value)
      ? value
      : (typeof value === 'string' ? value.split(',').map(s => s.trim()).filter(Boolean) : []);
    return items.length ? { title, items } : null;
  };

  if (Array.isArray(skills)) {
    // Already new format
    normalizedSkills = skills.map(g => ({
      title: g.title ?? 'Skills',
      items: Array.isArray(g.items) ? g.items : []
    }));
  } else if (skills && typeof skills === 'object') {
    const groups = [
      asGroup('Programming', skills.languages || skills.programming || skills.code),
      asGroup('Software', skills.software || skills.tools || skills.tooling),
      asGroup('Soft Skills', skills.softSkills || skills.softskills),
      asGroup('Other', skills.other || skills.misc)
    ].filter(Boolean);
    normalizedSkills = groups;
  }

  // Fold tests / presentations (if you tracked them) into skills so nothing is lost
  if (Array.isArray(C.tests) && C.tests.length) {
    const list = C.tests.map(t =>
      [t.name, t.score, t.details, t.date].filter(Boolean).join(' — ')
    ).filter(Boolean);
    if (list.length) normalizedSkills.push({ title: 'Test Scores', items: list });
  }
  

  C.skills = normalizedSkills;

  // --- contact fallback if list was still empty
  if (!Array.isArray(C.personal.contacts) || !C.personal.contacts.length) {
    C.personal.contacts = [];
  }

  // Save back
  window.CONTENT = C;
})();
