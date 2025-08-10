// news-api.js — fetch markdown news files, parse YAML front matter, and render title, date, location, and FULL description.

async function fetchNewsList() {
  const endpoint = 'https://api.github.com/repos/Sandip345/personal-website/contents/content/news';
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error(`GitHub API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return (Array.isArray(data) ? data : []).filter(f => f.name && f.name.toLowerCase().endsWith('.md'));
}

/* --- Minimal YAML parser fallback for multi-line support --- */
function leadingSpaces(s) { const m = (s||'').match(/^\s*/); return m ? m[0].length : 0; }
function readBlockScalar(lines, i, baseIndent, style) {
  const contentIndent = baseIndent + 2;
  let j = i + 1;
  const content = [];
  while (j < lines.length) {
    const raw = lines[j];
    if (raw.trim() === '') { content.push(''); j++; continue; }
    if (leadingSpaces(raw) < contentIndent) break;
    content.push(raw.slice(contentIndent));
    j++;
  }
  const chomp = style.endsWith('-');
  const isFolded = style.startsWith('>');
  let text = isFolded
    ? content.join('\n').split(/\n{2,}/).map(p => p.replace(/\n/g, ' ')).join('\n\n')
    : content.join('\n');
  if (chomp) text = text.replace(/\n+$/, '');
  return { value: text, nextIndex: j - 1 };
}
function parseYamlFallback(yamlText) {
  const lines = (yamlText||'').replace(/\r\n?/g, '\n').split('\n');
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
      const blk = readBlockScalar(lines, i, baseIndent, value || '>');
      value = blk.value; i = blk.nextIndex;
    } else if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    meta[key] = value;
  }
  return meta;
}
/* ----------------------------------------------------------- */

function parseFrontMatter(text) {
  const delim = '---';
  const parts = text.split(delim);
  if (parts.length < 3) return {};
  const yamlBlock = parts[1];
  const body = parts.slice(2).join(delim).trim();

  let meta = {};
  if (typeof window !== 'undefined' && window.jsyaml && typeof window.jsyaml.load === 'function') {
    try { meta = window.jsyaml.load(yamlBlock) || {}; }
    catch { meta = parseYamlFallback(yamlBlock); }
  } else {
    meta = parseYamlFallback(yamlBlock);
  }

  meta.body = body;
  return meta;
}

function parseDateLoose(s) {
  if (!s || typeof s !== 'string') return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) { const d = new Date(s); return isNaN(d.getTime()) ? null : d; }
  const t = Date.parse(s); return isNaN(t) ? null : new Date(t);
}

function formatDisplayDate(d) {
  if (!(d instanceof Date) || isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(d);
}

async function getNewsItems() {
  const files = await fetchNewsList();
  const items = [];
  for (const file of files) {
    try {
      const r = await fetch(file.download_url);
      if (!r.ok) throw new Error(`Failed to fetch ${file.name}: ${r.status}`);
      const raw = await r.text();
      const meta = parseFrontMatter(raw);

      const rawDate = (meta.date || '').trim();
      const d = parseDateLoose(rawDate);
      const displayDate = d ? formatDisplayDate(d) : (rawDate || '');

      items.push({
        slug: file.name.replace(/\.md$/i, ''),
        title: (meta.title || '').trim(),
        location: (meta.location || '').trim(),
        date: displayDate,
        description: (meta.description || '').trim(), // FULL text kept
        _sortTime: d ? d.getTime() : -Infinity
      });
    } catch (e) { console.error(e); }
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

  if (!news.length) { list.innerHTML = '<p>No news items available at this time. Check back soon!</p>'; return; }

  list.innerHTML = '';
  news.forEach(item => {
    const article = document.createElement('article');
    article.className = 'news-item';

    // Title
    const h2 = document.createElement('h2');
    h2.className = 'news-title';
    h2.textContent = item.title || '(Untitled)';
    article.appendChild(h2);

    // Meta
    const metaBits = [];
    if (item.date) metaBits.push(item.date);
    if (item.location) metaBits.push(item.location);
    if (metaBits.length) {
      const metaEl = document.createElement('p');
      metaEl.className = 'news-meta';
      metaEl.textContent = metaBits.join(' • ');
      article.appendChild(metaEl);
    }

    // FULL description
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
    if (list) list.innerHTML = '<p>Sorry, we couldn’t load the news right now.</p>';
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }
}

document.addEventListener('DOMContentLoaded', initNews);
