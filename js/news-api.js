// news-api.js — fetches markdown news files from GitHub, parses YAML front matter (incl. multiline),
// and renders a list with title, date, location, and description/body preview.

async function fetchNewsList() {
  const endpoint = 'https://api.github.com/repos/Sandip345/personal-website/contents/content/news';
  const response = await fetch(endpoint);
  if (!response.ok) throw new Error(`GitHub API error ${response.status}: ${await response.text()}`);
  const data = await response.json();
  return (Array.isArray(data) ? data : []).filter(it => it.name && it.name.endsWith('.md'));
}

/** Read a block scalar (>, >-, |, |-) starting at lines[i+1] with indentation > baseIndent */
function readBlockScalar(lines, i, baseIndent, style) {
  let j = i + 1;
  let chunks = [];
  while (j < lines.length) {
    const raw = lines[j];
    if (!raw.trim()) { chunks.push(''); j++; continue; }
    const indent = raw.match(/^\s*/)[0].length;
    if (indent <= baseIndent) break;
    chunks.push(raw.slice(baseIndent + 1)); // remove one extra indent level
    j++;
  }
  const chomp = style.endsWith('-');     // >- or |-
  const isFolded = style.startsWith('>');
  let text;
  if (isFolded) {
    // Fold: join lines with spaces, but keep blank lines
    text = chunks
      .join('\n')
      .split(/\n{2,}/)
      .map(par => par.replace(/\n/g, ' '))
      .join('\n\n');
  } else {
    // Literal: preserve newlines
    text = chunks.join('\n');
  }
  if (chomp) text = text.replace(/\n+$/, '');
  return { value: text, nextIndex: j - 1 };
}

/** Minimal YAML front-matter parser with multiline scalar support */
function parseFrontMatter(text) {
  const delimiter = '---';
  const parts = text.split(delimiter);
  if (parts.length < 3) return {};
  const yaml = parts[1];
  const body = parts.slice(2).join(delimiter).replace(/^\s+/, '');

  const lines = yaml.replace(/\r\n?/g, '\n').split('\n');
  const meta = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const m = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!m) continue;

    const key = m[1].trim();
    let value = (m[2] ?? '').trim();

    // Multiline scalar?
    if (value === '' || value === '>' || value === '>-' || value === '|' || value === '|-') {
      const baseIndent = line.match(/^\s*/)[0].length;
      const style = value || '>'; // treat empty after ":" as folded by default
      const blk = readBlockScalar(lines, i, baseIndent, style);
      value = blk.value;
      i = blk.nextIndex;
    } else {
      // Strip surrounding quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
    }

    meta[key] = value;
  }

  meta.body = body.trim();
  return meta;
}

function parseDateLoose(input) {
  if (!input || typeof input !== 'string') return null;
  const iso = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const d = new Date(input);
    return isNaN(d) ? null : d;
  }
  const t = Date.parse(input);
  return isNaN(t) ? null : new Date(t);
}

function formatDisplayDate(d) {
  if (!(d instanceof Date) || isNaN(d)) return '';
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(d);
}

// Shorten long text to first 3 sentences
function getPreviewText(text, maxSentences = 3) {
  if (!text) return '';
  const sentences = text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).filter(Boolean);
  return sentences.slice(0, maxSentences).join(' ');
}

async function getNewsItems() {
  const files = await fetchNewsList();
  const items = [];
  for (const file of files) {
    try {
      const resp = await fetch(file.download_url);
      if (!resp.ok) throw new Error(`Failed to fetch ${file.name}: ${resp.status}`);
      const raw = await resp.text();
      const meta = parseFrontMatter(raw);

      const rawDate = (meta.date || '').trim();
      const parsedDate = parseDateLoose(rawDate);
      const displayDate = parsedDate ? formatDisplayDate(parsedDate) : (rawDate || '');

      items.push({
        slug: file.name.replace(/\.md$/i, ''),
        title: (meta.title || '').trim(),
        description: (meta.description || '').trim(), // now supports multi-line YAML
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
      list.innerHTML = `<p>Sorry, we couldn’t load the news right now.</p>`;
    }
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }
}

document.addEventListener('DOMContentLoaded', initNews);
