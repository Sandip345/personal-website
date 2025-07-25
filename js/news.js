/*
 * This script populates the news page by reading the CONTENT.news
 * array defined in content.js. Each news item includes a title,
 * date, location and description. You can add or edit items in
 * CONTENT.news to update this page without changing the HTML.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Update footer year
  document.getElementById('year').textContent = new Date().getFullYear();

  const list = document.getElementById('news-list');
  if (!CONTENT.news || !CONTENT.news.length) {
    list.innerHTML = '<p>No news items available at this time. Check back soon!</p>';
    return;
  }
  CONTENT.news.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'news-item';
    const h2 = document.createElement('h2');
    h2.textContent = item.title;
    div.appendChild(h2);
    const meta = document.createElement('div');
    meta.className = 'news-meta';
    meta.textContent = `${item.date} • ${item.location}`;
    div.appendChild(meta);
    const p = document.createElement('p');
    p.textContent = item.description;
    div.appendChild(p);
    list.appendChild(div);
  });
});
