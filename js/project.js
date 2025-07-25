/*
 * This script powers the individual project detail page. It reads the
 * project ID from the URL query string, retrieves the corresponding
 * project from CONTENT.projects, and renders a detailed view. If no
 * project is found, a fallback message is displayed.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Insert current year in footer
  document.getElementById('year').textContent = new Date().getFullYear();

  const params = new URLSearchParams(window.location.search);
  const idParam = params.get('id');
  const id = parseInt(idParam, 10);
  const container = document.getElementById('project-details');

  if (isNaN(id) || !CONTENT.projects[id]) {
    container.innerHTML = '<p>Sorry, the requested project could not be found.</p>';
    return;
  }
  const project = CONTENT.projects[id];
  // Build the project detail layout
  const title = document.createElement('h1');
  title.textContent = project.name;
  container.appendChild(title);
  const period = document.createElement('p');
  period.style.color = 'var(--color-primary)';
  period.style.marginTop = '-0.3rem';
  period.style.fontWeight = '600';
  period.textContent = project.period;
  container.appendChild(period);
  const img = document.createElement('img');
  img.src = project.image;
  img.alt = project.name;
  img.style.width = '100%';
  img.style.maxHeight = '400px';
  img.style.objectFit = 'cover';
  img.style.borderRadius = '8px';
  container.appendChild(img);
  const desc = document.createElement('p');
  desc.style.marginTop = '1rem';
  desc.style.lineHeight = '1.6';
  desc.textContent = project.longDescription || project.description;
  container.appendChild(desc);
  // Tags
  if (project.tags && project.tags.length) {
    const tags = document.createElement('div');
    tags.className = 'tags';
    project.tags.forEach((tag) => {
      const span = document.createElement('span');
      span.textContent = tag;
      tags.appendChild(span);
    });
    container.appendChild(tags);
  }
});
