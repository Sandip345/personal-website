// news-api.js — recursively list all markdown files under content/news,
// parse YAML front matter (js-yaml if present; safe fallback built-in),
// and render Title, Date, Location, and FULL Description (no truncation).

const REPO = 'Sandip345/personal-website';
const ROOT_PATH = 'content/news';

/* ---------------- cache-busting helpers ---------------- */
function bust(url) {
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}ts=${Date.now()}`;
}
async function getJSON(url) {
  const res = await fetch(bust(url), { cache: 'no-store' });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
}
async function getText(url) {
  const res = await fetch(bust(url), { cache: 'no-store' });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.text();
}
/* ------------------------------------------------------- */

/* ---------- recursively walk GitHub directory ---------- */
async function listMarkdownFiles(path) {
  const api = `https://api.github.com/repos/${REPO}/contents/${encodeURIComponent(path)}`;
  let entries = [];
  try { entries = await getJSON(api); } catch (e) { console.error('List failed:', path, e); return []; }
  if (!Array.isArray(entries)) return [];
  const out = [];
  for (const it of entries) {
    if (it.type === 'file' && it.name.toLowerCase().endsWith('.md')) out.push(it);
    else if (it.type === 'dir') out.push(...(await listMarkdownFiles(`${path}/${it.name}`)));
  }
  return out;
}
/* ------------------------------------------------------- */

/* ---------------- YAML parsing (with fallback) --------- */
function leadingSpaces(s){const m=(s||'').match(/^\s*/);return m?m[0].length:0;}
function readBlockScalar(lines,i,baseIndent,style){
  const contentIndent = baseIndent + 2;
  let j = i + 1, content = [];
  while (j < lines.length) {
    const raw = lines[j];
    if (raw.trim() === '') { content.push(''); j++; continue; }
    if (leadingSpaces(raw) < contentIndent) break;
    content.push(raw.slice(contentIndent));
    j++;
  }
  const chomp = style.endsWith('-'), isFolded = style.startsWith('>');
  let text = isFolded
    ? content.join('\n').split(/\n{2,}/).map(p => p.replace(/\n/g,' ')).join('\n\n')
    : content.join('\n');
  if (chomp) text = text.replace(/\n+$/, '');
  return { value: text, nextIndex: j - 1 };
}
function parseYamlFallback(yamlText){
  const lines=(yamlText||'').replace(/\r\n?/g,'\n').split('\n');
  const meta={};
  for(let i=0;i<lines.length;i++){
    const line=lines[i];
    if(!line.trim()||line.trim().startsWith('#')) continue;
    const m=line.match(/^(\s*)([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if(!m) continue;
    const baseIndent=m[1].length, key=m[2].trim();
    let value=(m[3]??'').trim();
    if(value===''||value==='>'||value==='>-'||value==='|'||value==='|-'){
      const blk=readBlockScalar(lines,i,baseIndent,value||'>');
      value=blk.value; i=blk.nextIndex;
    } else if ((value.startsWith('"')&&value.endsWith('"'))||(value.startsWith("'")&&value.endsWith("'"))){
      value=value.slice(1,-1);
    }
    meta[key]=value;
  }
  return meta;
}
function parseFrontMatter(text){
  const parts = text.split('---');
  if (parts.length < 3) return {};
  const yamlBlock = parts[1];
  const body = parts.slice(2).join('---').trim();
  let meta = {};
  if (window.jsyaml && typeof window.jsyaml.load === 'function') {
    try { meta = window.jsyaml.load(yamlBlock) || {}; }
    catch (e) { console.warn('js-yaml failed, fallback used:', e); meta = parseYamlFallback(yamlBlock); }
  } else {
    meta = parseYamlFallback(yamlBlock);
  }
  meta.body = body;
  return meta;
}
/* ------------------------------------------------------- */

function parseDateLoose(s){
  if(!s||typeof s!=='string') return null;
  if(/^\d{4}-\d{2}-\d{2}/.test(s)){ const d=new Date(s); return isNaN(d.getTime())?null:d; }
  const t=Date.parse(s); return isNaN(t)?null:new Date(t);
}
function formatDisplayDate(d){
  if(!(d instanceof Date)||isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric'}).format(d);
}

/* ------------------- build items & render --------------- */
async function getNewsItems(){
  const files = await listMarkdownFiles(ROOT_PATH);
  const items = [];
  for (const f of files) {
    try {
      const raw = await getText(f.download_url);
      const meta = parseFrontMatter(raw);
      const rawDate = (meta.date || '').trim();
      const d = parseDateLoose(rawDate);
      items.push({
        slug: f.path.replace(/^content\/news\/|\.md$/gi,''),
        title: (meta.title || '').trim(),
        location: (meta.location || '').trim(),
        date: d ? formatDisplayDate(d) : (rawDate || ''),
        description: (meta.description || '').trim(), // full text
        _sortTime: d ? d.getTime() : -Infinity
      });
    } catch (e) {
      console.error('Load/parse failed:', f.path, e);
    }
  }
  return items;
}

function renderNews(news){
  const list = document.getElementById('news-list');
  if(!list) return;
  list.innerHTML = '';

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  news.sort((a,b)=>b._sortTime - a._sortTime);

  if(!news.length){
    list.innerHTML = '<p>No news items available at this time. Check back soon!</p>';
    return;
  }

  news.forEach(item=>{
    const article=document.createElement('article');
    article.className='news-item';

    const h2=document.createElement('h2');
    h2.className='news-title';
    h2.textContent=item.title || '(Untitled)';
    article.appendChild(h2);

    const bits=[];
    if(item.date) bits.push(item.date);
    if(item.location) bits.push(item.location);
    if(bits.length){
      const metaEl=document.createElement('p');
      metaEl.className='news-meta';
      metaEl.textContent=bits.join(' • ');
      article.appendChild(metaEl);
    }

    if(item.description){
      const p=document.createElement('p');
      p.textContent=item.description;
      article.appendChild(p);
    }

    list.appendChild(article);
  });
}

async function initNews(){
  try{
    const items = await getNewsItems();
    renderNews(items);
  }catch(err){
    console.error('Error loading news:', err);
    const list=document.getElementById('news-list');
    if(list) list.innerHTML='<p>Sorry, we couldn’t load the news right now.</p>';
    const yearEl=document.getElementById('year');
    if(yearEl) yearEl.textContent=new Date().getFullYear();
  }
}

document.addEventListener('DOMContentLoaded', initNews);
