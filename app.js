/*
 * This script reads the CONTENT constant defined in content.js and
 * dynamically populates each section of the webpage. It also
 * implements interaction logic such as responsive navigation and
 * expanding/collapsing timeline details.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Populate hero section
  const heroName = document.getElementById('hero-name');
  const heroTagline = document.getElementById('hero-tagline');
  const heroDesc = document.getElementById('hero-description');
  heroName.textContent = CONTENT.personal.name;
  heroTagline.textContent = CONTENT.personal.tagline;
  heroDesc.textContent = CONTENT.personal.description;

  // Populate about section
  renderAbout();

  // Build timelines
  renderEducation();
  renderExperience();

  // Build projects grid
  renderProjects();

  // Build skills & achievements
  renderSkills();

  // Populate contact
  renderContact();

  // Insert current year in footer
  document.getElementById('year').textContent = new Date().getFullYear();

  // Handle responsive navigation
  setupNavigation();
});

function renderAbout() {
  const container = document.getElementById('about-content');
  // Create paragraphs
  CONTENT.about.paragraphs.forEach((para) => {
    const p = document.createElement('p');
    p.textContent = para;
    p.style.marginBottom = '1rem';
    container.appendChild(p);
  });
  // Optionally add CV download link
  const cvLink = document.createElement('a');
  cvLink.href = CONTENT.personal.cvLink;
  cvLink.textContent = 'Download CV';
  cvLink.className = 'btn';
  cvLink.style.marginTop = '1rem';
  cvLink.setAttribute('download', 'Sandip_Gautam_CV.pdf');
  container.appendChild(cvLink);
}

function renderTimelineItem(item, isEducation = false) {
  const div = document.createElement('div');
  div.className = 'timeline-item';
  // Title (degree or position)
  const h3 = document.createElement('h3');
  h3.textContent = isEducation ? item.degree : item.title;
  div.appendChild(h3);
  // Period and institution or organization
  const period = document.createElement('div');
  period.className = 'timeline-period';
  period.textContent = `${item.period}${item.location ? ' • ' + item.location : ''}`;
  div.appendChild(period);
  // Subtitle for institution/organization (if not included in heading)
  const subtitle = document.createElement('div');
  subtitle.style.fontStyle = 'italic';
  subtitle.style.color = 'var(--color-text)';
  subtitle.style.marginBottom = '0.5rem';
  subtitle.textContent = isEducation ? item.institution : item.organization;
  div.appendChild(subtitle);
  // Details container
  const details = document.createElement('div');
  details.className = 'details';
  // Always display details: for education as a paragraph, for experience as list.
  if (isEducation) {
    const p = document.createElement('p');
    p.textContent = item.details;
    details.appendChild(p);
  } else {
    const list = document.createElement('ul');
    list.style.listStyle = 'disc';
    list.style.marginLeft = '1.2rem';
    list.style.fontSize = '0.9rem';
    item.details.forEach((d) => {
      const li = document.createElement('li');
      li.style.marginBottom = '0.3rem';
      li.textContent = d;
      list.appendChild(li);
    });
    details.appendChild(list);
  }
  div.appendChild(details);
  return div;
}

function renderEducation() {
  const container = document.getElementById('education-list');
  CONTENT.education.forEach((edu) => {
    const item = renderTimelineItem(edu, true);
    container.appendChild(item);
  });
}

function renderExperience() {
  const container = document.getElementById('experience-list');
  CONTENT.experience.forEach((exp) => {
    const item = renderTimelineItem(exp, false);
    container.appendChild(item);
  });
}

function renderProjects() {
  const grid = document.getElementById('projects-grid');
  CONTENT.projects.forEach((proj, index) => {
    // Create anchor wrapper so each project links to a detail page
    const link = document.createElement('a');
    link.href = `project.html?id=${index}`;
    link.className = 'project-card';
    link.style.textDecoration = 'none';
    link.style.color = 'inherit';

    // Image
    const img = document.createElement('img');
    img.src = proj.image;
    img.alt = proj.name;
    link.appendChild(img);
    // Card content
    const content = document.createElement('div');
    content.className = 'card-content';
    const title = document.createElement('h3');
    title.textContent = proj.name;
    content.appendChild(title);
    const period = document.createElement('div');
    period.style.fontSize = '0.8rem';
    period.style.color = 'var(--color-primary)';
    period.style.marginBottom = '0.5rem';
    period.textContent = proj.period;
    content.appendChild(period);
    const desc = document.createElement('p');
    desc.textContent = proj.description;
    content.appendChild(desc);
    // Tags
    const tags = document.createElement('div');
    tags.className = 'tags';
    proj.tags.forEach((tag) => {
      const span = document.createElement('span');
      span.textContent = tag;
      tags.appendChild(span);
    });
    content.appendChild(tags);
    link.appendChild(content);
    grid.appendChild(link);
  });
}

function renderSkills() {
  const container = document.getElementById('skills-content');
  // Languages
  container.appendChild(createSkillGroup('Programming Languages', CONTENT.skills.languages));
  container.appendChild(createSkillGroup('Software', CONTENT.skills.software));
  container.appendChild(createSkillGroup('Soft Skills', CONTENT.skills.softSkills));
  container.appendChild(createSkillGroup('Other', CONTENT.skills.other));
  // Test scores
  const testGroup = document.createElement('div');
  testGroup.className = 'skill-group';
  const h3 = document.createElement('h3');
  h3.textContent = 'Test Scores';
  testGroup.appendChild(h3);
  const ul = document.createElement('ul');
  CONTENT.tests.forEach((test) => {
    const li = document.createElement('li');
    li.textContent = `${test.name}: ${test.score} (${test.details}, taken ${test.date})`;
    ul.appendChild(li);
  });
  testGroup.appendChild(ul);
  container.appendChild(testGroup);
  // Presentations (displayed as a simple list on a new line rather than as a skill group)
  if (CONTENT.presentations && CONTENT.presentations.length) {
    const presWrapper = document.createElement('div');
    presWrapper.style.marginTop = '1rem';
    // Bold label
    const label = document.createElement('strong');
    label.textContent = 'Presentations:';
    presWrapper.appendChild(label);
    // List presentations with line breaks
    CONTENT.presentations.forEach((pres, idx) => {
      const p = document.createElement('p');
      p.style.margin = '0.2rem 0';
      p.textContent = `${pres.title}, ${pres.event}, ${pres.location}, ${pres.date}`;
      presWrapper.appendChild(p);
    });
    container.appendChild(presWrapper);
  }
}

function createSkillGroup(title, items) {
  const group = document.createElement('div');
  group.className = 'skill-group';
  const h3 = document.createElement('h3');
  h3.textContent = title;
  group.appendChild(h3);
  const ul = document.createElement('ul');
  items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    ul.appendChild(li);
  });
  group.appendChild(ul);
  return group;
}

function renderContact() {
  const list = document.getElementById('contact-list');
  CONTENT.personal.contacts.forEach((c) => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.className = 'icon';
    // Use simple unicode icons for contact types
    let iconChar = '';
    if (c.type.toLowerCase() === 'email') iconChar = '✉️';
    else if (c.type.toLowerCase() === 'phone') iconChar = '📞';
    else iconChar = '📍';
    span.textContent = iconChar;
    li.appendChild(span);
    const link = document.createElement('a');
    link.style.color = 'inherit';
    link.style.textDecoration = 'none';
    link.textContent = `${c.value}`;
    if (c.link) link.href = c.link;
    li.appendChild(link);
    list.appendChild(li);
  });
}

function setupNavigation() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('open');
  });
  // Scroll to anchor on click and collapse nav on mobile
  document.querySelectorAll('.nav-links a').forEach((link) => {
    link.addEventListener('click', (e) => {
      navLinks.classList.remove('active');
      hamburger.classList.remove('open');
    });
  });
}