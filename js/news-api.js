async function fetchNewsList() {
  const response = await fetch('https://api.github.com/repos/Sandip345/personal-website/contents/content/news');
  const data = await response.json();
  return data.filter(item => item.name.endsWith('.md'));
}

function parseFrontMatter(text) {
  const delimiter = '---';
  const parts = text.split(delimiter);
  if (parts.length >= 3) {
    const yaml = parts[1];
    const body = parts.slice(2).join(delimiter);
    const lines = yaml.trim().split('\n');
    const metadata = {};
    lines.forEach(line => {
      const [key, ...rest] = line.split(':');
      metadata[key.trim()] = rest.join(':').trim();
    });
    metadata.body = body.trim();
    return metadata;
  }
  return {};
}

async function getNewsItems() {
  const files = await fetchNewsList();
  const items = [];
  for (const file of files) {
    const resp = await fetch(file.download_url);
    const text = await resp.text();
    const meta = parseFrontMatter(text);
    meta.slug = file.name.replace('.md', '');
    items.push(meta);
  }
  return items;
}

function renderNews(news) {
  const list = document.getElementById('news-list');
  if (!list) return;
  list.innerHTML = '';
  news.sort((a, b) => new Date(b.date) - new Date(a.date));
  news.forEach(item => {
    const article = document.createElement('article');
    article.className = 'news-item';
    article.innerHTML = `\n      <h2>${item.title}</h2>\n      <p class="news-meta">${item.date} &middot; ${item.location}</p>\n      <p>${item.description}</p>\n    `;
    list.appendChild(article);
  });
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

async function initNews() {
  try {
    const items = await getNewsItems();
    renderNews(items);
  } catch (err) {
    console.error('Error loading news:', err);
  }
}

document.addEventListener('DOMContentLoaded', initNews);
