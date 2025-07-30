async function fetchProjectList() {
  const apiUrl = 'https://api.github.com/repos/Sandip345/personal-website/contents/content/projects';
  const response = await fetch(apiUrl);
  if (!response.ok) {
    console.error('Failed to fetch projects list');
    return [];
  }
  const files = await response.json();
  return files.filter(f => f.name.endsWith('.md'));
}

function parseFrontMatter(markdown) {
  const regex = /^---\s*([\s\S]*?)\s*---/;
  const match = markdown.match(regex);
  const metadata = {};
  if (match) {
    const lines = match[1].split('\n');
    lines.forEach(line => {
      const idx = line.indexOf(':');
      if (idx > -1) {
        const key = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).trim();
        metadata[key] = value;
      }
    });
  }
  return metadata;
}

async function getProjects() {
  const list = await fetchProjectList();
  const items = await Promise.all(list.map(async file => {
    const mdResp = await fetch(file.download_url);
    const mdText = await mdResp.text();
    const meta = parseFrontMatter(mdText);
    const slug = file.name.replace(/\.md$/, '');
    return {
      slug,
      title: meta.title || '',
      date: meta.date || '',
      description: meta.description || '',
      location: meta.location || '',
      tags: meta.tags || '',
      body: mdText
    };
  }));
  // sort by date descending if date exists
  items.sort((a, b) => {
    const da = new Date(a.date);
    const db = new Date(b.date);
    return db - da;
  });
  return items;
}

async function renderProjectsGrid() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  const projects = await getProjects();
  grid.innerHTML = '';
  projects.forEach(item => {
    const link = document.createElement('a');
    link.className = 'project-card';
    link.href = `project.html?slug=${encodeURIComponent(item.slug)}`;
    link.style.textDecoration = 'none';
    link.style.color = 'inherit';

    // Title
    const titleEl = document.createElement('h3');
    titleEl.textContent = item.title;
    // Description
    const descEl = document.createElement('p');
    descEl.textContent = item.description;
    link.appendChild(titleEl);
    link.appendChild(descEl);

    grid.appendChild(link);
  });
}

async function renderProjectsSection() {
  // optional: show only first 3 projects on homepage if necessary
  await renderProjectsGrid();
}

document.addEventListener('DOMContentLoaded', () => {
  renderProjectsSection().catch(err => console.error(err));
});
