// project-api.js — reads ?slug=, finds the matching MD under content/projects (recursively),
// parses YAML front matter (js-yaml if available, safe fallback otherwise),
// and renders Title, Period, Tags, and FULL Body into #project-details.

const REPO = "Sandip345/personal-website";
const PROJECT_ROOT = "content/projects";

/* ---------- helpers with cache-busting ---------- */
function bust(url) {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}ts=${Date.now()}`;
}
async function getJSON(url) {
  const res = await fetch(bust(url), { cache: "no-store" });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
}
async function getText(url) {
  const res = await fetch(bust(url), { cache: "no-store" });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.text();
}

/* ---------- recursively list all .md files ---------- */
async function listProjectFiles(path) {
  const api = `https://api.github.com/repos/${REPO}/contents/${encodeURIComponent(path)}`;
  let entries = [];
  try {
    entries = await getJSON(api);
  } catch (e) {
    console.error("List failed:", path, e);
    return [];
  }
  if (!Array.isArray(entries)) return [];
  const out = [];
  for (const it of entries) {
    if (it.type === "file" && it.name.toLowerCase().endsWith(".md")) {
      out.push(it);
    } else if (it.type === "dir") {
      out.push(...(await listProjectFiles(`${path}/${it.name}`)));
    }
  }
  return out;
}

/* ---------- tiny YAML parser fallback (multiline support) ---------- */
function leadingSpaces(s) {
  const m = (s || "").match(/^\s*/);
  return m ? m[0].length : 0;
}
function readBlockScalar(lines, i, baseIndent, style) {
  const contentIndent = baseIndent + 2;
  let j = i + 1;
  const content = [];
  while (j < lines.length) {
    const raw = lines[j];
    if (raw.trim() === "") {
      content.push("");
      j++;
      continue;
    }
    if (leadingSpaces(raw) < contentIndent) break;
    content.push(raw.slice(contentIndent));
    j++;
  }
  const chomp = style.endsWith("-");
  const isFolded = style.startsWith(">");
  let text = isFolded
    ? content.join("\n").split(/\n{2,}/).map(p => p.replace(/\n/g, " ")).join("\n\n")
    : content.join("\n");
  if (chomp) text = text.replace(/\n+$/, "");
  return { value: text, nextIndex: j - 1 };
}
function parseYamlFallback(yamlText) {
  const lines = (yamlText || "").replace(/\r\n?/g, "\n").split("\n");
  const meta = {};
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const m = line.match(/^(\s*)([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const baseIndent = m[1].length;
    const key = m[2].trim();
    let value = (m[3] ?? "").trim();
    if (value === "" || value === ">" || value === ">-" || value === "|" || value === "|-") {
      const blk = readBlockScalar(lines, i, baseIndent, value || ">");
      value = blk.value;
      i = blk.nextIndex;
    } else if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    // Lists like: tags: [PIV, Thermal]
    if (value.startsWith("[") && value.endsWith("]")) {
      value = value
        .slice(1, -1)
        .split(",")
        .map(s => s.trim().replace(/^['"]|['"]$/g, ""))
        .filter(Boolean);
    }
    meta[key] = value;
  }
  return meta;
}
function parseFrontMatter(text) {
  const parts = text.split("---");
  if (parts.length < 3) return { meta: {}, body: text };
  const yamlBlock = parts[1];
  const body = parts.slice(2).join("---").trim();

  let meta = {};
  if (window.jsyaml && typeof window.jsyaml.load === "function") {
    try {
      meta = window.jsyaml.load(yamlBlock) || {};
    } catch (e) {
      console.warn("js-yaml failed, using fallback:", e);
      meta = parseYamlFallback(yamlBlock);
    }
  } else {
    meta = parseYamlFallback(yamlBlock);
  }
  return { meta, body };
}

/* ---------- utils ---------- */
function getSlug() {
  const params = new URLSearchParams(window.location.search);
  return (params.get("slug") || "").trim();
}
function formatTags(tags) {
  if (!tags) return "";
  if (Array.isArray(tags)) return tags.join(", ");
  if (typeof tags === "string") return tags;
  return "";
}

/* ---------- render ---------- */
function renderProject({ title, period, tags, description, cover_image, gallery, body }) {
  const host = document.getElementById("project-details");
  if (!host) return;
  host.innerHTML = "";

  const article = document.createElement("article");
  article.className = "project-detail";

  const h1 = document.createElement("h1");
  h1.className = "section-title";
  h1.textContent = title || "(Untitled Project)";
  article.appendChild(h1);

  if (cover_image) {
    const hero = document.createElement('img');
    hero.className = 'project-hero';
    hero.src = cover_image;
    hero.alt = title ? `${title} cover image` : 'Project cover image';
    hero.loading = 'lazy';
    article.appendChild(hero);
  }

  const metaBits = [];
  if (period) metaBits.push(period);
  const tagText = formatTags(tags);
  if (tagText) metaBits.push(tagText);

  if (metaBits.length) {
    const meta = document.createElement("p");
    meta.className = "news-meta";
    meta.textContent = metaBits.join(" • ");
    article.appendChild(meta);
  }

  if (description) {
    const d = document.createElement("p");
    d.textContent = description;
    article.appendChild(d);
  }

  const bodyEl = document.createElement("div");
  bodyEl.className = "project-body";
  // If a markdown parser is available, use it; else show plain text with preserved line breaks.
  if (window.marked && typeof window.marked.parse === "function") {
    bodyEl.innerHTML = window.marked.parse(body || "");
  } else {
    bodyEl.textContent = body || "";
    bodyEl.style.whiteSpace = "pre-line";
  }
  article.appendChild(bodyEl);

  const galleryImages = Array.isArray(gallery) ? gallery : [];
  if (galleryImages.length) {
    const g = document.createElement('div');
    g.className = 'project-gallery';
    galleryImages.forEach((src) => {
      if (!src) return;
      const img = document.createElement('img');
      img.src = src;
      img.alt = title ? `${title} image` : 'Project image';
      img.loading = 'lazy';
      g.appendChild(img);
    });
    article.appendChild(g);
  }

  host.appendChild(article);
}

/* ---------- main flow ---------- */
async function loadProject() {
  const slug = getSlug();
  const container = document.getElementById("project-details");
  if (!slug) {
    if (container) container.innerHTML = "<p>Missing project slug.</p>";
    return;
  }

  // Find a file whose path ends with `${slug}.md` (works in subfolders)
  const files = await listProjectFiles(PROJECT_ROOT);
  const match = files.find(f => f.path.toLowerCase().endsWith(`/${slug.toLowerCase()}.md`));
  if (!match) {
    if (container) container.innerHTML = `<p>Project not found: <code>${slug}</code></p>`;
    return;
  }

  try {
    const raw = await getText(match.download_url);
    const { meta, body } = parseFrontMatter(raw);
    renderProject({
      title: (meta.title || "").trim(),
      period: (meta.period || "").trim(),
      tags: meta.tags || [],
      description: (meta.description || "").trim(),
      cover_image: meta.cover_image || '',
      gallery: meta.gallery || [],
      body: body || ""
    });
  } catch (e) {
    console.error("Failed to load project:", e);
    if (container) container.innerHTML = "<p>Failed to load this project.</p>";
  }
}

document.addEventListener("DOMContentLoaded", loadProject);
