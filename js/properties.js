(function () {
  const propertiesGrid = document.getElementById('property-grid');
  const propertyDetail = document.getElementById('property-detail');
  let properties = [];

  function dataPath(name) {
    return window.location.pathname.includes('/pages/') ? `../data/${name}` : `data/${name}`;
  }

  function numericValue(value) {
    if (!value) return 0;
    const digits = value.match(/\d+/g);
    return digits ? parseInt(digits.join(''), 10) : 0;
  }

  function propertyUrl(slug) {
    return `property.html?slug=${encodeURIComponent(slug)}`;
  }

  function createBadge(text) {
    const span = document.createElement('span');
    span.className = 'badge bg-light text-dark';
    span.textContent = text;
    return span;
  }

  function createCard(item) {
    const col = document.createElement('div');
    col.className = 'col mb-4';
    col.dataset.location = (item.address || '').toLowerCase();
    col.dataset.price = numericValue(item.price);
    col.dataset.bedrooms = item.bedrooms || '';

    const card = document.createElement('div');
    card.className = 'card h-100';

    if (item.image) {
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.src = item.image;
      img.alt = item.title || '';
      img.className = 'card-img-top';
      img.style.aspectRatio = '3/2';
      img.style.objectFit = 'cover';
      card.appendChild(img);
    }

    const body = document.createElement('div');
    body.className = 'card-body d-flex flex-column';

    const header = document.createElement('div');
    header.className = 'd-flex justify-content-between align-items-start mb-2';

    const title = document.createElement('h5');
    title.className = 'card-title mb-0';
    title.textContent = item.title || '';
    header.appendChild(title);

    if (item.price) {
      const price = document.createElement('h6');
      price.className = 'text-accent fw-bold';
      price.textContent = item.price;
      header.appendChild(price);
    }

    body.appendChild(header);

    if (item.address) {
      const address = document.createElement('div');
      address.className = 'd-flex align-items-center mb-2';
      address.innerHTML = `<i class="rtmicon rtmicon-location me-2"></i><span class="text-muted">${item.address}</span>`;
      body.appendChild(address);
    }

    if (item.description) {
      const description = document.createElement('p');
      description.className = 'card-text flex-grow-1';
      description.textContent = item.description;
      body.appendChild(description);
    }

    const footer = document.createElement('div');
    footer.className = 'd-flex justify-content-between align-items-center mt-auto';

    const badges = document.createElement('div');
    badges.className = 'd-flex gap-3 flex-wrap';
    if (item.bedrooms) badges.appendChild(createBadge(`${item.bedrooms} guļamist.`));
    if (item.bathrooms) badges.appendChild(createBadge(`${item.bathrooms} vann.`));
    footer.appendChild(badges);

    const link = document.createElement('a');
    link.className = 'btn btn-accent btn-sm';
    link.href = propertyUrl(item.slug);
    link.innerHTML = '<span>Skatīt</span><i class="rtmicon rtmicon-arrow-up-right ms-1"></i>';
    footer.appendChild(link);

    body.appendChild(footer);
    card.appendChild(body);
    col.appendChild(card);
    return col;
  }

  function renderList(items) {
    if (!propertiesGrid) return;
    propertiesGrid.innerHTML = '';
    items.forEach(item => propertiesGrid.appendChild(createCard(item)));

    const count = document.getElementById('property-count');
    if (count) count.textContent = `${items.length} īpašumi atrasti`;

    const empty = document.getElementById('empty-state');
    if (empty) empty.style.display = items.length ? 'none' : 'block';
    propertiesGrid.style.display = items.length ? '' : 'none';
  }

  function renderDetail(item) {
    if (!propertyDetail) return;
    if (!item) {
      propertyDetail.innerHTML = '<div class="alert alert-warning">Īpašums nav atrasts.</div>';
      return;
    }

    const gallery = Array.isArray(item.gallery) ? item.gallery : [];
    propertyDetail.innerHTML = `
      <div class="row gy-4">
        <div class="col-lg-7">
          <div class="property-gallery d-grid gap-4">
            ${gallery.length ? gallery.map(image => `
              <div class="property-gallery-item">
                <img class="img-fluid rounded-4" loading="lazy" src="${image.src}" alt="${image.alt || item.title}">
                ${image.caption ? `<p class="text-muted small mt-2">${image.caption}</p>` : ''}
              </div>
            `).join('') : '<div class="alert alert-info">Galerija vēl nav pievienota.</div>'}
          </div>
        </div>
        <div class="col-lg-5">
          <span class="badge bg-primary mb-3">Pārdošanā</span>
          <h1 class="display-5 fw-semibold mb-3">${item.title}</h1>
          ${item.price ? `<p class="h4 text-accent mb-3">${item.price}</p>` : ''}
          ${item.address ? `<p class="text-muted mb-4"><i class="rtmicon rtmicon-location me-2"></i>${item.address}</p>` : ''}
          ${item.description ? `<p class="mb-4">${item.description}</p>` : ''}
          <div class="d-flex flex-wrap gap-3 mb-4">
            ${item.area ? `<span class="badge bg-light text-dark px-3 py-2">${item.area} m²</span>` : ''}
            ${item.bedrooms ? `<span class="badge bg-light text-dark px-3 py-2">${item.bedrooms} guļamistabas</span>` : ''}
            ${item.bathrooms ? `<span class="badge bg-light text-dark px-3 py-2">${item.bathrooms} vannas</span>` : ''}
            ${item.floors ? `<span class="badge bg-light text-dark px-3 py-2">${item.floors}. stāvs</span>` : ''}
          </div>
          <a class="btn btn-accent btn-lg" href="mailto:info@vandoreheritage.lv">Sazināties</a>
        </div>
      </div>`;
  }

  function applyFilters() {
    if (!propertiesGrid) return;
    let filtered = [...properties];

    const location = (document.getElementById('location-search')?.value || '').trim().toLowerCase();
    const min = parseInt(document.getElementById('min-price')?.value || '', 10);
    const max = parseInt(document.getElementById('max-price')?.value || '', 10);
    const bedrooms = document.getElementById('bedrooms-prop')?.value || '';

    if (location) filtered = filtered.filter(item => (item.address || '').toLowerCase().includes(location));
    if (!Number.isNaN(min)) filtered = filtered.filter(item => numericValue(item.price) >= min);
    if (!Number.isNaN(max)) filtered = filtered.filter(item => numericValue(item.price) <= max);
    if (bedrooms) filtered = filtered.filter(item => (item.bedrooms || 0) === parseInt(bedrooms, 10));

    renderList(filtered);
  }

  function wireFilters() {
    ['location-search', 'min-price', 'max-price'].forEach(id => {
      const input = document.getElementById(id);
      if (input) input.addEventListener('input', () => setTimeout(applyFilters, 150));
    });
    document.getElementById('bedrooms-prop')?.addEventListener('change', applyFilters);
    document.getElementById('apply-filters')?.addEventListener('click', applyFilters);

    ['clear-filters', 'clear-filters-link', 'clear-filters-mobile'].forEach(id => {
      const btn = document.getElementById(id);
      btn?.addEventListener('click', (event) => {
        event?.preventDefault();
        ['location-search', 'min-price', 'max-price', 'bedrooms-prop'].forEach(field => {
          const el = document.getElementById(field);
          if (el) el.value = '';
        });
        applyFilters();
      });
    });
  }

  fetch(dataPath('properties.json'))
    .then(res => res.json())
    .then(json => {
      properties = Array.isArray(json.properties) ? json.properties : [];
      if (propertiesGrid) {
        renderList(properties);
        wireFilters();
      }
      if (propertyDetail) {
        const slug = new URLSearchParams(window.location.search).get('slug');
        const selected = properties.find(item => item.slug === slug) || properties[0];
        renderDetail(selected);
      }
    })
    .catch(() => {
      if (propertiesGrid) propertiesGrid.innerHTML = '<div class="alert alert-warning w-100">Neizdevās ielādēt īpašumu sarakstu.</div>';
    });
})();

