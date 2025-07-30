async function fetchProjectMarkdown(slug) {
  const apiUrl = `https://raw.githubusercontent.com/Sandip345/personal-website/main/content/projects/${slug}.md`;
  const response = await fetch(apiUrl);
  if (!response.ok) {
    console.error('Failed to fetch project', slug);
    return null;
  }
  return await response.text();
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

function extractBody(markdown) {
  const regex = /^---\s*([\s\S]*?)\s*---/;
  const match = markdown.match(regex);
  let body = markdown;
  if (match) {
    body = markdown.slice(match[0].length).trim();
  }
  return body;
}

function markdownToHtml(body) {
  const paragraphs = body.split(/\n\s*\n/);
  return paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
}

async function renderProject() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const container = document.getElementById('project-details');
  if (!slug || !container) {
    if (container) container.innerHTML = '<p>Project not found.</p>';
    return;
  }
  const mdText = await fetchProjectMarkdown(slug);
  if (!mdText) {
    container.innerHTML = '<p>Project not found.</p>';
    return;
  }
  const meta = parseFrontMatter(mdText);
  const body = extractBody(mdText);
  const bodyHtml = markdownToHtml(body);

  container.innerHTML = '';
  const titleEl = document.createElement('h2');
  titleEl.textContent = meta.title || slug;
  const metaEl = document.createElement('div');
  metaEl.className = 'project-meta';
  metaEl.textContent = (meta.date ? meta.date : '') + (meta.location ? ' | ' + meta.location : '');
  const descEl = document.createElement('p');
  descEl.textContent = meta.description || '';
  const contentEl = document.createElement('div');
  contentEl.innerHTML = bodyHtml;

  container.appendChild(titleEl);
  container.appendChild(metaEl);
  container.appendChild(descEl);
  container.appendChild(contentEl);

  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderProject().catch(err => console.error(err));
});
