(function () {
  const CACHE = {};

  function resolve(file) {
    const path = window.location.pathname;
    if (path.includes('/pages/')) {
      return `../data/${file}`;
    }
    return `data/${file}`;
  }

  async function fetchJson(file) {
    if (CACHE[file]) return CACHE[file];
    const response = await fetch(resolve(file));
    if (!response.ok) throw new Error(`Failed to load ${file}`);
    const json = await response.json();
    CACHE[file] = json;
    return json;
  }

  function buildCard(property) {
    const col = document.createElement('div');
    col.className = 'col mb-4';
    col.dataset.location = (property.address || '').toLowerCase();
    col.dataset.price = property.price ? (property.price.match(/\d+/g) || []).join('') : '';
    col.dataset.bedrooms = property.bedrooms || '';

    const card = document.createElement('div');
    card.className = 'card h-100';

    if (property.image) {
      const img = document.createElement('img');
      img.src = property.image;
      img.alt = property.title || '';
      img.className = 'card-img-top';
      img.style.aspectRatio = '3/2';
      img.style.objectFit = 'cover';
      img.loading = 'lazy';
      card.appendChild(img);
    }

    const body = document.createElement('div');
    body.className = 'card-body d-flex flex-column';

    const header = document.createElement('div');
    header.className = 'd-flex justify-content-between align-items-start mb-2';

    const title = document.createElement('h5');
    title.className = 'card-title mb-0';
    title.textContent = property.title || '';
    header.appendChild(title);

    if (property.price) {
      const price = document.createElement('h6');
      price.className = 'text-accent fw-bold';
      price.textContent = property.price;
      header.appendChild(price);
    }

    body.appendChild(header);

    if (property.address) {
      const locationRow = document.createElement('div');
      locationRow.className = 'd-flex align-items-center mb-2';
      locationRow.innerHTML = `<i class="rtmicon rtmicon-location me-2"></i><span class="text-muted">${property.address}</span>`;
      body.appendChild(locationRow);
    }

    if (property.description) {
      const desc = document.createElement('p');
      desc.className = 'card-text flex-grow-1';
      desc.textContent = property.description;
      body.appendChild(desc);
    }

    const footer = document.createElement('div');
    footer.className = 'd-flex justify-content-between align-items-center mt-auto';

    const badges = document.createElement('div');
    badges.className = 'd-flex gap-3';
    if (property.bedrooms) {
      badges.appendChild(createBadge(`${property.bedrooms} guļamistabas`));
    }
    if (property.bathrooms) {
      badges.appendChild(createBadge(`${property.bathrooms} vannas`));
    }
    footer.appendChild(badges);

    const link = document.createElement('a');
    link.className = 'btn btn-accent btn-sm';
    link.href = buildDetailUrl(property.slug);
    link.innerHTML = '<span>Skatīt</span><i class="rtmicon rtmicon-arrow-up-right ms-1"></i>';
    footer.appendChild(link);

    body.appendChild(footer);
    card.appendChild(body);
    col.appendChild(card);
    return col;
  }

  function createBadge(text) {
    const span = document.createElement('span');
    span.className = 'badge bg-light text-dark';
    span.textContent = text;
    return span;
  }

  function buildDetailUrl(slug) {
    const base = window.location.pathname.includes('/pages/') ? 'property.html' : 'pages/property.html';
    return `${base}?slug=${encodeURIComponent(slug)}`;
  }

  function populateList(properties) {
    const grid = document.getElementById('property-grid');
    if (!grid) return;
    grid.innerHTML = '';
    properties.forEach(property => grid.appendChild(buildCard(property)));
    const count = document.getElementById('property-count');
    if (count) count.textContent = `${properties.length} īpašumi atrasti`;
    window.dispatchEvent(new CustomEvent('properties:data-ready'));
  }

  function populateDetail(properties) {
    const wrapper = document.getElementById('property-detail');
    if (!wrapper) return;
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    const property = properties.find(item => item.slug === slug) || properties[0];
    if (!property) {
      wrapper.innerHTML = '<div class="alert alert-warning">Īpašums nav atrasts.</div>';
      return;
    }

    const gallery = Array.isArray(property.gallery) ? property.gallery : [];
    const galleryHtml = gallery.map(item => `
      <div class="property-gallery-item">
        <img src="${item.src}" alt="${item.alt || property.title}" class="img-fluid rounded-4" loading="lazy">
        ${item.caption ? `<p class="text-muted small mt-2">${item.caption}</p>` : ''}
      </div>
    `).join('');

    wrapper.innerHTML = `
      <div class="row gy-4">
        <div class="col-lg-7">
          <div class="property-gallery d-grid gap-4">
            ${galleryHtml || '<div class="alert alert-info">Galerija vēl nav pievienota.</div>'}
          </div>
        </div>
        <div class="col-lg-5">
          <span class="badge bg-primary mb-3">Pārdošanā</span>
          <h1 class="display-5 fw-semibold mb-3">${property.title}</h1>
          ${property.price ? `<p class="h4 text-accent mb-3">${property.price}</p>` : ''}
          ${property.address ? `<p class="text-muted mb-4"><i class="rtmicon rtmicon-location me-2"></i>${property.address}</p>` : ''}
          ${property.description ? `<p class="mb-4">${property.description}</p>` : ''}
          <div class="d-flex flex-wrap gap-3 mb-4">
            ${property.area ? `<span class="badge bg-light text-dark px-3 py-2">${property.area} m²</span>` : ''}
            ${property.bedrooms ? `<span class="badge bg-light text-dark px-3 py-2">${property.bedrooms} guļamistabas</span>` : ''}
            ${property.bathrooms ? `<span class="badge bg-light text-dark px-3 py-2">${property.bathrooms} vannas</span>` : ''}
            ${property.floors ? `<span class="badge bg-light text-dark px-3 py-2">${property.floors}. stāvs</span>` : ''}
          </div>
          <a href="mailto:info@vandoreheritage.lv" class="btn btn-accent btn-lg">Sazināties</a>
        </div>
      </div>
    `;
  }

  function init() {
    fetchJson('properties.json')
      .then(data => {
        const properties = Array.isArray(data.properties) ? data.properties : [];
        window.propertiesData = properties;
        populateList(properties);
        populateDetail(properties);
      })
      .catch(() => {
        const grid = document.getElementById('property-grid');
        if (grid) grid.innerHTML = '<div class="alert alert-warning w-100">Neizdevās ielādēt īpašumu sarakstu.</div>';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
