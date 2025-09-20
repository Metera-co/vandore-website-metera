(function () {
  const rentalsGrid = document.getElementById('rentals-grid');
  const rentalDetail = document.getElementById('rental-detail');
  let rentals = [];

  function dataPath(name) {
    return window.location.pathname.includes('/pages/') ? `../data/${name}` : `data/${name}`;
  }

  function numericValue(value) {
    if (!value) return 0;
    const digits = value.match(/\d+/g);
    return digits ? parseInt(digits.join(''), 10) : 0;
  }

  function makeBadge(text) {
    const span = document.createElement('span');
    span.className = 'badge bg-light text-dark';
    span.textContent = text;
    return span;
  }

  function makeImage(src, alt, className) {
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.src = src;
    img.alt = alt || '';
    img.className = className;
    return img;
  }

  function rentalUrl(slug) {
    return `rental.html?slug=${encodeURIComponent(slug)}`;
  }

  function createCard(item) {
    const col = document.createElement('div');
    col.className = 'col';
    col.dataset.location = (item.address || '').toLowerCase();
    col.dataset.price = numericValue(item.price);
    col.dataset.bedrooms = item.bedrooms || '';
    col.dataset.type = item.type || '';

    const card = document.createElement('div');
    card.className = 'card h-100 border-0 shadow-sm overflow-hidden';

    const images = document.createElement('div');
    images.className = 'card-image-group';
    if (item.image_1) images.appendChild(makeImage(item.image_1, item.image_1_alt || item.title, 'card-img-top card-img-primary'));
    if (item.image_2) images.appendChild(makeImage(item.image_2, item.image_2_alt || item.title, 'card-img-top card-img-secondary'));
    card.appendChild(images);

    const body = document.createElement('div');
    body.className = 'card-body d-flex flex-column p-4';

    const header = document.createElement('div');
    header.className = 'd-flex justify-content-between align-items-start mb-3';

    const title = document.createElement('h3');
    title.className = 'h5 mb-0';
    title.textContent = item.title || '';
    header.appendChild(title);

    const badge = document.createElement('span');
    badge.className = `badge ${item.type === 'short' ? 'bg-success' : 'bg-primary'}`;
    badge.textContent = item.type === 'short' ? 'Īstermiņa' : 'Īre';
    header.appendChild(badge);

    body.appendChild(header);

    if (item.price) {
      const price = document.createElement('p');
      price.className = 'fw-semibold text-accent mb-2';
      price.textContent = item.price;
      body.appendChild(price);
    }

    if (item.address) {
      const address = document.createElement('p');
      address.className = 'text-muted small mb-3';
      address.textContent = item.address;
      body.appendChild(address);
    }

    if (item.description) {
      const description = document.createElement('p');
      description.className = 'flex-grow-1';
      description.textContent = item.description;
      body.appendChild(description);
    }

    const footer = document.createElement('div');
    footer.className = 'd-flex justify-content-between align-items-center mt-auto';

    const meta = document.createElement('div');
    meta.className = 'd-flex gap-3 text-muted small flex-wrap';
    if (item.bedrooms) meta.appendChild(makeBadge(`${item.bedrooms} ist.`));
    if (item.bathrooms) meta.appendChild(makeBadge(`${item.bathrooms} vann.`));
    if (item.area) meta.appendChild(makeBadge(`${item.area} m²`));
    footer.appendChild(meta);

    const more = document.createElement('a');
    more.className = 'btn btn-outline-secondary btn-sm';
    more.href = rentalUrl(item.slug);
    more.textContent = 'Skatīt';
    footer.appendChild(more);

    body.appendChild(footer);
    card.appendChild(body);
    col.appendChild(card);
    return col;
  }

  function renderList(items) {
    if (!rentalsGrid) return;
    rentalsGrid.innerHTML = '';
    items.forEach(item => rentalsGrid.appendChild(createCard(item)));

    const count = document.getElementById('rentals-count');
    if (count) count.textContent = `${items.length} piedāvājumi`;

    const empty = document.getElementById('rentals-empty');
    if (empty) empty.classList.toggle('d-none', items.length > 0);
  }

  function renderDetail(item) {
    if (!rentalDetail) return;
    if (!item) {
      rentalDetail.innerHTML = '<div class="alert alert-warning">Piedāvājums nav atrasts.</div>';
      return;
    }

    rentalDetail.innerHTML = `
      <div class="row gy-4 align-items-start">
        <div class="col-lg-6">
          <div class="d-flex flex-column gap-3">
            ${item.image_1 ? `<img class="img-fluid rounded-4" loading="lazy" src="${item.image_1}" alt="${item.image_1_alt || item.title}">` : ''}
            ${item.image_2 ? `<img class="img-fluid rounded-4" loading="lazy" src="${item.image_2}" alt="${item.image_2_alt || item.title}">` : ''}
          </div>
        </div>
        <div class="col-lg-6">
          <span class="badge ${item.type === 'short' ? 'bg-success' : 'bg-primary'} mb-3">${item.type === 'short' ? 'Īstermiņa' : 'Ilgtermiņa'}</span>
          <h1 class="display-5 fw-semibold mb-3">${item.title}</h1>
          ${item.price ? `<p class="h4 text-accent mb-2">${item.price}</p>` : ''}
          ${item.address ? `<p class="text-muted mb-4"><i class="rtmicon rtmicon-location me-2"></i>${item.address}</p>` : ''}
          ${item.description ? `<p class="mb-4">${item.description}</p>` : ''}
          <div class="d-flex flex-wrap gap-3 mb-4">
            ${item.bedrooms ? `<span class="badge bg-light text-dark px-3 py-2">${item.bedrooms} guļamistabas</span>` : ''}
            ${item.bathrooms ? `<span class="badge bg-light text-dark px-3 py-2">${item.bathrooms} vannas</span>` : ''}
            ${item.area ? `<span class="badge bg-light text-dark px-3 py-2">${item.area} m²</span>` : ''}
            ${item.floors ? `<span class="badge bg-light text-dark px-3 py-2">${item.floors}. stāvs</span>` : ''}
          </div>
          <a class="btn btn-accent btn-lg" href="mailto:info@vandoreheritage.lv">Pieteikt pieejamību</a>
        </div>
      </div>`;
  }

  function applyFilters() {
    if (!rentalsGrid) return;
    let filtered = [...rentals];

    const location = (document.getElementById('location')?.value || '').trim().toLowerCase();
    const min = parseInt(document.getElementById('price-min')?.value || '', 10);
    const max = parseInt(document.getElementById('price-max')?.value || '', 10);
    const bedrooms = document.getElementById('bedrooms')?.value || '';
    const type = document.getElementById('rent-type')?.value || '';

    if (location) filtered = filtered.filter(item => (item.address || '').toLowerCase().includes(location));
    if (!Number.isNaN(min)) filtered = filtered.filter(item => numericValue(item.price) >= min);
    if (!Number.isNaN(max)) filtered = filtered.filter(item => numericValue(item.price) <= max);
    if (bedrooms) {
      if (bedrooms.includes('+')) {
        const minRooms = parseInt(bedrooms.replace('+', ''), 10) || 0;
        filtered = filtered.filter(item => (item.bedrooms || 0) >= minRooms);
      } else {
        const exactRooms = parseInt(bedrooms, 10) || 0;
        filtered = filtered.filter(item => (item.bedrooms || 0) === exactRooms);
      }
    }
    if (type) filtered = filtered.filter(item => (item.type || '') === type);

    renderList(filtered);
  }

  function w\u012AreFilters() {
    ['location', 'price-min', 'price-max'].forEach(id => {
      const input = document.getElementById(id);
      if (input) input.addEventListener('input', () => setTimeout(applyFilters, 150));
    });
    ['bedrooms', 'rent-type'].forEach(id => {
      const select = document.getElementById(id);
      select?.addEventListener('change', applyFilters);
    });

    document.getElementById('apply-rental-filters')?.addEventListener('click', applyFilters);
    document.getElementById('clear-rental-filters')?.addEventListener('click', () => {
      ['location', 'price-min', 'price-max', 'bedrooms', 'rent-type'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      applyFilters();
    });
  }

  fetch(dataPath('rentals.json'))
    .then(res => res.json())
    .then(json => {
      rentals = Array.isArray(json.rentals) ? json.rentals : [];
      if (rentalsGrid) {
        renderList(rentals);
        w\u012AreFilters();
      }
      if (rentalDetail) {
        const slug = new URLSearchParams(window.location.search).get('slug');
        const selected = rentals.find(item => item.slug === slug) || rentals[0];
        renderDetail(selected);
      }
    })
    .catch(() => {
      if (rentalsGrid) rentalsGrid.innerHTML = '<div class="alert alert-warning w-100">Neizdevās ielādēt īres piedāvājumus.</div>';
    });
})();
      if (rentalsGrid) rentalsGrid.innerHTML = '<div class="alert alert-warning w-100">Neizdev\u0101s iel\u0101d\u0113t \u012bres pied\u0101v\u0101jumus.</div>';
