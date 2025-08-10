// news-api.js — fetch markdown news files from GitHub, parse YAML front matter (incl. multiline),
// and render title, date, location, and description/body preview.

async function fetchNewsList() {
  const endpoint = 'https://api.github.com/repos/Sandip345/personal-website/contents/content/news';
  const response = await fetch(endpoint);
  if (!response.ok) throw new Error(`GitHub API error ${response.status}: ${await response.text()}`);
  const data = await response.json();
  return (Array.isArray(data) ? data : []).filter(it => it.name && it.name.toLowerCase().endsWith('.md'));
}

/** Count leading spaces */
function leadingSpaces(s) {
  const m = (s || '').match(/^\s*/);
  return m ? m[0].length : 0;
}

/** Read a YAML block scalar (>, >-, |, |-) starting after the current key line. */
function readBlockScalar(lines, startIndex, baseIndent, style) {
  // YAML content lines for a block scalar are typically indented by at least baseIndent + 2
  const contentIndent = baseIndent + 2;
  let j = startIndex + 1;
  const content = [];

  while (j < lines.length) {
    const raw = lines[j];

    // Allow completely empty lines inside the block
    if (raw.trim() === '') {
      content.push('');
      j++;
      continue;
    }

    const indent = leadingSpaces(raw);
    if (indent < contentIndent) break; // block ends when indentation drops

    // remove the block indentation
    content.push(raw.slice(contentIndent));
    j++;
  }

  const chomp = style.endsWith('-');       // >- or |-
  const isFolded = style.startsWith('>');  // folded vs literal
  let text;
  if (isFolded) {
    // Fold: single newlines become spaces; keep paragraph breaks
    text = content
      .join('\n')
      .split(/\n{2,}/)
      .map(par => par.replace(/\n/g, ' '))
      .join('\n\n');
  } else {
    // Literal: preserve newlines
    text = content.join('\n');
  }
  if (chomp) text = text.replace(/\n+$/, '');
  return { value: text, nextIndex: j - 1 };
}

/** Minimal YAML parser that supports key: value and block scalars */
function parseYamlManually(yamlText) {
  const lines = (yamlText || '').replace(/\r\n?/g, '\n').split('\n');
  const meta = {};
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const m = line.match(/^(\s*)([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!m) continue;

    const baseIndent = m[1].length;
    const key = m[2].trim();
    let value = (m[3] ?? '').trim();

    if (value === '' || value === '>' || value === '>-' || value === '|' || value === '|-') {
      const style = value || '>'; // treat empty as folded by default
      const blk = readBlockScalar(lines, i, baseIndent, style);
      value = blk.value;
      i = blk.nextIndex;
    } else {
      // Strip surrounding quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
    }
    meta[key] = value;
  }
  return meta;
}

/** Parse front matter using js-yaml if present, else fallback to manual parser */
function parseFrontMatter(text) {
  const delimiter = '---';
  const parts = text.split(delimiter);
  if (parts.length < 3) return {};
  const yamlBlock = parts[1];
  const body = parts.slice(2).join(delimiter).trim();

  let meta = {};
  if (typeof window !== 'undefined' && typeof window.jsyaml !== 'undefined' && typeof window.jsyaml.load === 'function') {
    try {
      meta = window.jsyaml.load(yamlBlock) || {};
    } catch (e) {
      console.warn('js-yaml failed, falling back to manual parser:', e);
      meta = parseYamlManually(yamlBlock);
    }
  } else {
    meta = parseYamlManually(yamlBlock);
  }

  meta.body = body;
  return meta;
}

/** Date parsing tolerant of ISO or human formats */
function parseDateLoose(input) {
  if (!input || typeof input !== 'string') return null;
  // Prefer ISO first
  if (/^\d{4}-\d{2}-\d{2}/.test(input)) {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }
  const t = Date.parse(input);
  return isNaN(t) ? null : new Date(t);
}

function formatDisplayDate(d) {
  if (!(d instanceof Date) || isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(d);
}

// Shorten long text to first 3 sentences (browser-friendly, no lookbehind)
function getPreviewText(text, maxSentences = 3) {
  if (!text) return '';
  const normalized = text.replace(/\s+/g, ' ').trim();
  const sentences = normalized.match(/[^.!?]+[.!?]*/g) || [];
  return sentences.slice(0, maxSentences).join(' ').trim();
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
        description: (meta.description || '').trim(), // multiline handled by parser(s)
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

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Sort newest → oldest; undated last
  news.sort((a, b) => b._sortTime - a._sortTime);

  if (!news.length) {
    list.innerHTML = '<p>No news items available at this time. Check back soon!</p>';
    return;
  }

  list.innerHTML = '';
  news.forEach(item => {
    const article = document.createElement('article');
    article.className = 'news-item';

    // Title
    const h2 = document.createElement('h2');
    h2.className = 'news-title';
    h2.textContent = item.title || '(Untitled)';
    article.appendChild(h2);

    // Meta line: date • location
    const bits = [];
    if (item.date) bits.push(item.date);
    if (item.location) bits.push(item.location);
    if (bits.length) {
      const meta = document.createElement('p');
      meta.className = 'news-meta';
      meta.textContent = bits.join(' • ');
      article.appendChild(meta);
    }

    // Description or fallback preview
    const preview = item.description && item.description.length > 0
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
      list.innerHTML = '<p>Sorry, we couldn’t load the news right now.</p>';
    }
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }
}

document.addEventListener('DOMContentLoaded', initNews);

