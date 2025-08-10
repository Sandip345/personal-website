// news-api.js — fetches markdown news files from GitHub, parses front matter, and renders list

async function fetchNewsList() {
  const endpoint = 'https://api.github.com/repos/Sandip345/personal-website/contents/content/news';
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`GitHub API error ${response.status}: ${await response.text()}`);
  }
  const data = await response.json();
  return (Array.isArray(data) ? data : []).filter(item => item.name && item.name.endsWith('.md'));
}

function parseFrontMatter(text) {
  const delimiter = '---';
  const parts = text.split(delimiter);
  if (parts.length < 3) return {};

  const yaml = parts[1];
  const body = parts.slice(2).join(delimiter);

  const lines = yaml
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length && !l.startsWith('#'));

  const metadata = {};
  for (const line of lines) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    metadata[key] = value;
  }
  metadata.body = body.trim();
  return metadata;
}

function parseDateLoose(input) {
  if (!input || typeof input !== 'string') return null;
  const isoMatch = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }
  const t = Date.parse(input);
  if (!isNaN(t)) return new Date(t);
  return null;
}

function formatDisplayDate(d) {
  if (!(d instanceof Date) || isNaN(d.getTime())) return '';
  const fmt = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  return fmt.format(d);
}

// Helper to shorten long text to first 2–3 sentences
function getPreviewText(text, maxSentences = 3) {
  if (!text) return '';
  const sentences = text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
  return sentences.slice(0, maxSentences).join(' ');
}

async function getNewsItems() {
  const files = await fetchNewsList();
  const items = [];
  for (const file of files) {
    try {
      const resp = await fetch(file.download_url);
      if (!resp.ok) throw new Error(`Failed to fetch ${file.name}: ${resp.status}`);
      const text = await resp.text();
      const meta = parseFrontMatter(text);

      const rawDate = (meta.date || '').trim();
      const parsedDate = parseDateLoose(rawDate);
      const displayDate = parsedDate ? formatDisplayDate(parsedDate) : (rawDate || '');

      items.push({
        slug: file.name.replace(/\.md$/i, ''),
        title: (meta.title || '').trim(),
        description: (meta.description || '').trim(),
        location: (meta.location || '').trim(),
        date: displayDate,
        body: meta.body || '',
        _sortTime: parsedDate ? parsedDate.getTime() : -Infinity
      });
    } catch (e) {
      console.error(e);
    }
  }
  return items;
}

function renderNews(news) {
  const list = document.getElementById('news-list');
  if (!list) return;
  if (list.dataset.populated === 'true') return;
  list.dataset.populated = 'true';

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  news.sort((a, b) => b._sortTime - a._sortTime);

  if (!news.length) {
    list.innerHTML = '<p>No news items available at this time. Check back soon!</p>';
    return;
  }

  list.innerHTML = '';
  news.forEach(item => {
    const article = document.createElement('article');
    article.className = 'news-item';

    const h2 = document.createElement('h2');
    h2.className = 'news-title';
    h2.textContent = item.title || '(Untitled)';
    article.appendChild(h2);

    const bits = [];
    if (item.date) bits.push(item.date);
    if (item.location) bits.push(item.location);
    if (bits.length) {
      const meta = document.createElement('p');
      meta.className = 'news-meta';
      meta.textContent = bits.join(' • ');
      article.appendChild(meta);
    }

    // Choose description or body preview
    const preview = item.description && item.description.length > 10
      ? item.description
      : getPreviewText(item.body);

    if (preview) {
      const p = document.createElement('p');
      p.textContent = preview;
      article.appendChild(p);
    }

    list.appendChild(article);
  });
}

async function initNews() {
  try {
    const items = await getNewsItems();
    renderNews(items);
  } catch (err) {
    console.error('Error loading news:', err);
    const list = document.getElementById('news-list');
    if (list) {
      list.innerHTML = `
        <p>Sorry, we couldn’t load the news right now.</p>
        <pre style="white-space:pre-wrap;font-size:.85rem;">${String(err)}</pre>
      `;
    }
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }
}

document.addEventListener('DOMContentLoaded', initNews);
