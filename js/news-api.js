// news-api.js — pulls markdown files from GitHub content/news,
// reads front matter (title, date, location, description),
// sorts by date (descending), and renders to #news-list.

async function fetchNewsList() {
  const endpoint = 'https://api.github.com/repos/Sandip345/personal-website/contents/content/news';
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`GitHub API error ${response.status}: ${await response.text()}`);
  }
  const data = await response.json();
  // Only .md files
  return (Array.isArray(data) ? data : []).filter(item => item.name && item.name.endsWith('.md'));
}

/**
 * Very small front-matter parser:
 * ---
 * key: value
 * key2: value with: colon
 * ---
 * body...
 */
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
    // keep everything after the first colon as value
    let value = line.slice(idx + 1).trim();

    // strip surrounding quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    metadata[key] = value;
  }

  metadata.body = body.trim();
  return metadata;
}

/**
 * Try to parse various date shapes. Returns a Date or null.
 * Accepts ISO (YYYY-MM-DD) or human (e.g., "August 10, 2025").
 */
function parseDateLoose(input) {
  if (!input || typeof input !== 'string') return null;

  // Prefer ISO-like first
  const isoMatch = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }

  // Fallback to Date.parse for human-readable (e.g., "August 10, 2025")
  const t = Date.parse(input);
  if (!isNaN(t)) return new Date(t);

  return null;
}

/**
 * Format to "MMMM D, YYYY" (e.g., "August 10, 2025") for display.
 * If invalid or missing, returns an empty string.
 */
function formatDisplayDate(d) {
  if (!(d instanceof Date) || isNaN(d.getTime())) return '';
  // Use the user's timezone implicitly
  const fmt = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  return fmt.format(d);
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

      // Normalize fields to match your CMS schema
      const rawDate = (meta.date || '').trim();
      const parsedDate = parseDateLoose(rawDate);
      const displayDate = parsedDate ? formatDisplayDate(parsedDate) : (rawDate || '');

      items.push({
        slug: file.name.replace(/\.md$/i, ''),
        title: (meta.title || '').trim(),
        description: (meta.description || '').trim(), // optional
        location: (meta.location || '').trim(),       // may be empty
        date: displayDate,                            // for display
        _sortTime: parsedDate ? parsedDate.getTime() : -Infinity // for sorting
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

  // Avoid double-population if another script runs accidentally
  if (list.dataset.populated === 'true') return;
  list.dataset.populated = 'true';

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Sort newest → oldest; items with no valid date go last
  news.sort((a, b) => b._sortTime - a._sortTime);

  // Empty state
  if (!news.length) {
    list.innerHTML = '<p>No news items available at this time. Check back soon!</p>';
    return;
  }

  // Render
  list.innerHTML = '';
  news.forEach(item => {
    const article = document.createElement('article');
    article.className = 'news-item';

    // Title (bold by default in <h2>, long titles wrap)
    const h2 = document.createElement('h2');
    h2.className = 'news-title';
    h2.textContent = item.title || '(Untitled)';
    article.appendChild(h2);

    // Meta line: date • location (only show what exists)
    const bits = [];
    if (item.date) bits.push(item.date);
    if (item.location) bits.push(item.location);
    if (bits.length) {
      const meta = document.createElement('p');
      meta.className = 'news-meta';
      meta.textContent = bits.join(' • ');
      article.appendChild(meta);
    }

    // Optional description
    if (item.description) {
      const p = document.createElement('p');
      p.textContent = item.description;
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
    // Still update footer year
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }
}

document.addEventListener('DOMContentLoaded', initNews);
