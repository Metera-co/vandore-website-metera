(function () {
  const DATA_CACHE = {};

  function resolveDataUrl(file) {
    const path = window.location.pathname.replace(/\\/g, '/');
    const depth = (path.match(/\//g) || []).length;
    // pages are served from /pages/*.html so we typically need ../data
    if (path.includes('/pages/')) {
      return `../data/${file}`;
    }
    return `data/${file}`;
  }

  async function loadJson(file) {
    if (DATA_CACHE[file]) return DATA_CACHE[file];
    const response = await fetch(resolveDataUrl(file));
    if (!response.ok) throw new Error(`Failed to load ${file}`);
    const json = await response.json();
    DATA_CACHE[file] = json;
    return json;
  }

  function formatPrice(value) {
    if (!value) return '';
    return value;
  }

  function createImage(img, extraClass) {
    const image = document.createElement('img');
    image.src = img.src;
    image.alt = img.alt || '';
    image.className = extraClass;
    image.loading = 'lazy';
    return image;
  }

  function buildRentalCard(rental) {
    const col = document.createElement('div');
    col.className = 'col';
    col.dataset.location = (rental.address || '').toLowerCase();
    col.dataset.price = rental.price ? (rental.price.match(/\d+/g) || []).join('') : '';
    col.dataset.bedrooms = rental.bedrooms || '';
    col.dataset.type = rental.type || '';

    const card = document.createElement('div');
    card.className = 'card h-100 shadow-sm border-0 overflow-hidden';

    const imageGroup = document.createElement('div');
    imageGroup.className = 'card-image-group';
    if (rental.image_1) {
      imageGroup.appendChild(createImage({ src: rental.image_1, alt: rental.image_1_alt || rental.title }, 'card-img-top card-img-primary'));
    }
    if (rental.image_2) {
      imageGroup.appendChild(createImage({ src: rental.image_2, alt: rental.image_2_alt || rental.title }, 'card-img-top card-img-secondary'));
    }
    card.appendChild(imageGroup);

    const body = document.createElement('div');
    body.className = 'card-body d-flex flex-column p-4';

    const headingRow = document.createElement('div');
    headingRow.className = 'd-flex justify-content-between align-items-start mb-3';

    const title = document.createElement('h3');
    title.className = 'h5 mb-0';
    title.textContent = rental.title;
    headingRow.appendChild(title);

    const badge = document.createElement('span');
    badge.className = `badge ${rental.type === 'short' ? 'bg-success' : 'bg-primary'}`;
    badge.textContent = rental.type === 'short' ? 'Īstermiņa' : 'Īre';
    headingRow.appendChild(badge);

    body.appendChild(headingRow);

    if (rental.price) {
      const price = document.createElement('p');
      price.className = 'fw-semibold text-accent mb-2';
      price.textContent = formatPrice(rental.price);
      body.appendChild(price);
    }

    if (rental.address) {
      const address = document.createElement('p');
      address.className = 'text-muted small mb-3';
      address.textContent = rental.address;
      body.appendChild(address);
    }

    if (rental.description) {
      const desc = document.createElement('p');
      desc.className = 'flex-grow-1';
      desc.textContent = rental.description;
      body.appendChild(desc);
    }

    const meta = document.createElement('div');
    meta.className = 'd-flex justify-content-between align-items-center mt-auto';

    const metaList = document.createElement('div');
    metaList.className = 'd-flex gap-3 text-muted small';
    if (rental.bedrooms) metaList.appendChild(createMetaBadge(`${rental.bedrooms} ist.`));
    if (rental.bathrooms) metaList.appendChild(createMetaBadge(`${rental.bathrooms} vann.`));
    meta.appendChild(metaList);

    const link = document.createElement('a');
    link.className = 'btn btn-outline-secondary btn-sm';
    link.href = buildRentalUrl(rental.slug);
    link.textContent = 'Skatīt';
    meta.appendChild(link);

    body.appendChild(meta);
    card.appendChild(body);
    col.appendChild(card);
    return col;
  }

  function createMetaBadge(text) {
    const span = document.createElement('span');
    span.className = 'badge bg-light text-dark';
    span.textContent = text;
    return span;
  }

  function buildRentalUrl(slug) {
    const base = window.location.pathname.includes('/pages/') ? 'rental.html' : 'pages/rental.html';
    return `${base}?slug=${encodeURIComponent(slug)}`;
  }

  function populateRentals(rentals) {
    const grid = document.getElementById('rentals-grid');
    if (!grid) return;
    grid.innerHTML = '';
    rentals.forEach(rental => {
      grid.appendChild(buildRentalCard(rental));
    });

    const countEl = document.getElementById('rentals-count');
    if (countEl) {
      countEl.textContent = `${rentals.length} piedāvājumi`;
    }

    const empty = document.getElementById('rentals-empty');
    if (empty) {
      empty.classList.toggle('d-none', rentals.length > 0);
    }

    window.dispatchEvent(new CustomEvent('rentals:data-ready'));
  }

  function populateRentalDetail(rentals) {
    const wrapper = document.getElementById('rental-detail');
    if (!wrapper) return;

    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    const rental = rentals.find(item => item.slug === slug) || rentals[0];
    if (!rental) {
      wrapper.innerHTML = '<div class="alert alert-warning">Piedāvājums nav atrasts.</div>';
      return;
    }

    const primaryImage = rental.image_1 ? `<img src="${rental.image_1}" alt="${rental.image_1_alt || rental.title}" class="img-fluid rounded-4 mb-3" loading="lazy">` : '';
    const secondaryImage = rental.image_2 ? `<img src="${rental.image_2}" alt="${rental.image_2_alt || rental.title}" class="img-fluid rounded-4" loading="lazy">` : '';

    wrapper.innerHTML = `
      <div class="row gy-4 align-items-start">
        <div class="col-lg-6">
          <div class="d-flex flex-column gap-3">
            ${primaryImage}
            ${secondaryImage}
          </div>
        </div>
        <div class="col-lg-6">
          <span class="badge ${rental.type === 'short' ? 'bg-success' : 'bg-primary'} mb-3">${rental.type === 'short' ? 'Īstermiņa' : 'Ilgtermiņa'}</span>
          <h1 class="display-5 fw-semibold mb-3">${rental.title}</h1>
          ${rental.price ? `<p class="h4 text-accent mb-2">${formatPrice(rental.price)}</p>` : ''}
          ${rental.address ? `<p class="text-muted mb-4"><i class="rtmicon rtmicon-location me-2"></i>${rental.address}</p>` : ''}
          ${rental.description ? `<p class="mb-4">${rental.description}</p>` : ''}
          <div class="d-flex flex-wrap gap-3 mb-4">
            ${rental.bedrooms ? `<span class="badge bg-light text-dark px-3 py-2">${rental.bedrooms} guļamistabas</span>` : ''}
            ${rental.bathrooms ? `<span class="badge bg-light text-dark px-3 py-2">${rental.bathrooms} vannas</span>` : ''}
            ${rental.area ? `<span class="badge bg-light text-dark px-3 py-2">${rental.area} m²</span>` : ''}
          </div>
          <a href="mailto:info@vandoreheritage.lv" class="btn btn-accent btn-lg">Pieteikt pieejamību</a>
        </div>
      </div>
    `;
  }

  function init() {
    loadJson('rentals.json')
      .then(data => {
        const rentals = Array.isArray(data.rentals) ? data.rentals : [];
        window.rentalsData = rentals;
        populateRentals(rentals);
        populateRentalDetail(rentals);
      })
      .catch(() => {
        const grid = document.getElementById('rentals-grid');
        if (grid) grid.innerHTML = '<div class="alert alert-warning w-100">Neizdevās ielādēt īres piedāvājumus.</div>';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
