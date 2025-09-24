(function () {
  const DATA_URL = '/data/rentals.json';
  const STORAGE_KEY = 'vh-rental-filters-v1';

  const TYPE_LABELS = {
    short: 'Istermina ire',
    long: 'Ilgtermina ire'
  };

  const listContext = {
    grid: document.getElementById('rentals-grid'),
    count: document.getElementById('rentals-count'),
    chips: document.getElementById('rental-filter-chips'),
    empty: document.getElementById('rentals-empty'),
    emptyReset: document.getElementById('rentals-empty-reset'),
    form: document.getElementById('rental-filter-form')
  };

  const detailContext = {
    root: document.querySelector('[data-rental-detail]'),
    back: document.querySelector('[data-rental-back]'),
    relatedGrid: document.getElementById('rental-related-grid')
  };

  const defaultFilters = Object.freeze({
    location: '',
    priceMin: '',
    priceMax: '',
    bedrooms: '',
    type: ''
  });

  const chipLabels = {
    location: (value) => `Atra�anas vieta: ${value}`,
    priceMin: (value) => `Cena no ${formatNumber(value)} �`,
    priceMax: (value) => `Cena lidz ${formatNumber(value)} �`,
    bedrooms: (value) => value.includes('+') ? `Gulamistabas: ${value}` : `Gulamistabas: ${value}`,
    type: (value) => TYPE_LABELS[value] || value
  };

  let rentals = [];
  let appliedFilters = { ...defaultFilters };

  function normalize(text) {
    return (text || '').toString().trim().toLowerCase();
  }

  function numericValue(value) {
    if (value == null || value === '') return 0;
    if (typeof value === 'number') return value;
    const digits = String(value).match(/\d+/g);
    if (!digits) return 0;
    return Number.parseInt(digits.join(''), 10) || 0;
  }

  function formatNumber(value) {
    return new Intl.NumberFormat('lv-LV').format(Number(value));
  }

  function rentalUrl(slug) {
    const params = new URLSearchParams(window.location.search);
    params.set('slug', slug);
    return `rental.html?${params.toString()}`;
  }

  function readStoredFilters() {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object') {
        return { ...defaultFilters, ...parsed };
      }
    } catch (error) {
      console.warn('Neizdevas nolasit saglabatos ires filtrus', error);
    }
    return null;
  }

  function readQueryFilters() {
    const params = new URLSearchParams(window.location.search);
    const filters = { ...defaultFilters };
    params.forEach((value, key) => {
      if (Object.prototype.hasOwnProperty.call(filters, key)) {
        filters[key] = value;
      }
    });
    return filters;
  }

  function mergeFilters() {
    const stored = readStoredFilters();
    const query = readQueryFilters();
    return { ...defaultFilters, ...(stored || {}), ...query };
  }

  function persistFilters(filters) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.warn('Neizdevas saglabat ires filtrus', error);
    }
  }

  function updateFilterUrl(filters) {
    if (!listContext.grid) return;
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const queryString = params.toString();
    const newUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}`;
    window.history.replaceState({}, '', newUrl);
  }

  function populateForm() {
    const { form } = listContext;
    if (!form) return;
    Object.entries(appliedFilters).forEach(([key, value]) => {
      const field = form.elements.namedItem(key);
      if (field) {
        field.value = value;
      }
    });
  }

  function clearFilters() {
    appliedFilters = { ...defaultFilters };
    persistFilters(appliedFilters);
    populateForm();
    renderChips();
    updateFilterUrl(appliedFilters);
  }

  function collectFormFilters(formData) {
    const nextFilters = { ...defaultFilters };
    Object.keys(nextFilters).forEach((key) => {
      const value = formData.get(key);
      nextFilters[key] = value ? String(value).trim() : '';
    });
    return nextFilters;
  }

  function applyFilters(items) {
    if (!Array.isArray(items)) return [];
    return items.filter((item) => {
      if (appliedFilters.location) {
        const search = normalize(appliedFilters.location);
        const haystack = `${item.title || ''} ${item.address || ''}`;
        if (!normalize(haystack).includes(search)) {
          return false;
        }
      }
      if (appliedFilters.priceMin) {
        if (numericValue(item.price) < numericValue(appliedFilters.priceMin)) {
          return false;
        }
      }
      if (appliedFilters.priceMax) {
        if (numericValue(item.price) > numericValue(appliedFilters.priceMax)) {
          return false;
        }
      }
      if (appliedFilters.bedrooms) {
        if (appliedFilters.bedrooms.includes('+')) {
          const minRooms = Number.parseInt(appliedFilters.bedrooms.replace('+', ''), 10) || 0;
          if ((Number(item.bedrooms) || 0) < minRooms) return false;
        } else if ((Number(item.bedrooms) || 0) !== (Number(appliedFilters.bedrooms) || 0)) {
          return false;
        }
      }
      if (appliedFilters.type) {
        if ((item.type || '').toLowerCase() !== appliedFilters.type.toLowerCase()) {
          return false;
        }
      }
      return true;
    });
  }

  function renderList(items) {
    if (!listContext.grid) return;
    const fragment = document.createDocumentFragment();
    items.forEach((item) => fragment.appendChild(createCard(item)));
    listContext.grid.innerHTML = '';
    if (items.length) {
      listContext.grid.appendChild(fragment);
      listContext.grid.hidden = false;
      if (listContext.empty) listContext.empty.hidden = true;
    } else {
      listContext.grid.hidden = true;
      if (listContext.empty) listContext.empty.hidden = false;
    }
    if (listContext.count) {
      const total = items.length;
      const label = total === 1 ? '1 piedavajums' : `${formatNumber(total)} piedavajumi`;
      listContext.count.textContent = label;
    }
  }

  function renderChips() {
    if (!listContext.chips) return;
    const activeEntries = Object.entries(appliedFilters).filter(([, value]) => Boolean(value));
    listContext.chips.innerHTML = '';
    if (!activeEntries.length) {
      listContext.chips.setAttribute('hidden', '');
      return;
    }
    listContext.chips.removeAttribute('hidden');
    const fragment = document.createDocumentFragment();
    activeEntries.forEach(([key, value]) => {
      const chip = document.createElement('span');
      chip.className = 'vh-chip';
      chip.dataset.filterKey = key;
      chip.textContent = chipLabels[key] ? chipLabels[key](value) : `${key}: ${value}`;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'vh-chip__remove';
      remove.setAttribute('aria-label', `Nonemt filtru ${chip.textContent}`);
      remove.textContent = '�';
      chip.appendChild(remove);
      fragment.appendChild(chip);
    });
    listContext.chips.appendChild(fragment);
  }

  function createCard(item) {
    const article = document.createElement('article');
    article.className = 'vh-card';
    article.dataset.slug = item.slug || '';

    const media = document.createElement('div');
    media.className = 'vh-card__media';
    if (item.image_1) {
      const img = document.createElement('img');
      img.src = item.image_1;
      img.alt = item.image_1_alt || item.title || 'Ires ipa�ums';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.width = 1200;
      img.height = 900;
      img.sizes = '(min-width: 1200px) 280px, (min-width: 992px) 32vw, (min-width: 768px) 45vw, 92vw';
      media.appendChild(img);
    }
    const badge = document.createElement('span');
    badge.className = 'vh-card__badge';
    badge.textContent = TYPE_LABELS[item.type] || 'Ires piedavajums';
    media.appendChild(badge);
    article.appendChild(media);

    const body = document.createElement('div');
    body.className = 'vh-card__body';

    const title = document.createElement('h3');
    title.className = 'vh-card__title';
    title.textContent = item.title || 'Ires ipa�ums';
    body.appendChild(title);

    if (item.price) {
      const price = document.createElement('p');
      price.className = 'vh-card__subtitle';
      price.textContent = item.price;
      body.appendChild(price);
    }

    if (item.address) {
      const address = document.createElement('p');
      address.className = 'vh-card__subtitle';
      address.textContent = item.address;
      body.appendChild(address);
    }

    if (item.description) {
      const description = document.createElement('p');
      description.className = 'vh-card__description';
      description.textContent = item.description;
      body.appendChild(description);
    }

    const meta = document.createElement('div');
    meta.className = 'vh-card__meta';
    if (item.area) meta.appendChild(createMetaChip(`${item.area} m�`));
    if (item.bedrooms) meta.appendChild(createMetaChip(`${item.bedrooms} gulamist.`));
    if (item.bathrooms) meta.appendChild(createMetaChip(`${item.bathrooms} vann.`));
    body.appendChild(meta);

    const cta = document.createElement('div');
    cta.className = 'vh-card__cta';
    const link = document.createElement('a');
    link.className = 'vh-button vh-button--primary';
    link.href = rentalUrl(item.slug || '');
    link.rel = 'bookmark';
    link.textContent = 'Skatit piedavajumu';
    cta.appendChild(link);
    body.appendChild(cta);

    article.appendChild(body);
    return article;
  }

  function createMetaChip(label) {
    const span = document.createElement('span');
    span.textContent = label;
    return span;
  }

  function onChipClick(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.classList.contains('vh-chip__remove')) return;
    const chip = target.closest('.vh-chip');
    if (!chip) return;
    const key = chip.dataset.filterKey;
    if (key && Object.prototype.hasOwnProperty.call(appliedFilters, key)) {
      appliedFilters[key] = '';
      persistFilters(appliedFilters);
      populateForm();
      renderChips();
      updateFilterUrl(appliedFilters);
    }
  }

  function initListHandlers() {
    const { form } = listContext;
    if (!form) return;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      appliedFilters = collectFormFilters(formData);
      persistFilters(appliedFilters);
      renderChips();
      updateFilterUrl(appliedFilters);
    });

    form.addEventListener('reset', (event) => {
      event.preventDefault();
      clearFilters();
    });

    if (listContext.emptyReset) {
      listContext.emptyReset.addEventListener('click', (event) => {
        event.preventDefault();
        clearFilters();
      });
    }

    if (listContext.chips) {
      listContext.chips.addEventListener('click', onChipClick);
    }
  }

  function buildListUrl(path) {
    const params = new URLSearchParams();
    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const query = params.toString();
    return `${path}${query ? `?${query}` : ''}`;
  }

  function hydrateDetail() {
    if (!detailContext.root) return;
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    const item = slug ? rentals.find((entry) => entry.slug === slug) : rentals[0];

    if (!item) {
      detailContext.root.innerHTML = '<div class="vh-empty">Piedavajums nav atrasts.</div>';
      if (detailContext.back) detailContext.back.href = '/rentals.html';
      return;
    }

    updateHero(item);
    updateSpecs(item);
    updateSections(item);
    setupGallery(detailContext.root.querySelector('[data-rental-gallery]'), buildGalleryData(item), item.title);
    renderRelated(item);
    updateBackLink();
  }

  function updateHero(item) {
    const heroImage = detailContext.root.querySelector('[data-rental-hero-image]');
    if (heroImage instanceof HTMLImageElement) {
      if (item.image_1) heroImage.src = item.image_1;
      heroImage.alt = item.image_1_alt || item.title || 'Ires ipa�ums';
      heroImage.width = heroImage.width || 1440;
      heroImage.height = heroImage.height || 900;
    }
    setText('[data-rental-type]', TYPE_LABELS[item.type] || 'Ires piedavajums');
    setText('[data-rental-title]', item.title || 'Ires ipa�ums');
    setText('[data-rental-price]', item.price || '');
    setText('[data-rental-location]', item.address || '');
  }

  function updateSpecs(item) {
    setText('[data-rental-bedrooms]', item.bedrooms != null ? String(item.bedrooms) : '�');
    setText('[data-rental-bathrooms]', item.bathrooms != null ? String(item.bathrooms) : '�');
    setText('[data-rental-area]', item.area ? `${item.area} m�` : '�');
    setText('[data-rental-floors]', item.floors != null ? String(item.floors) : '�');
    const summary = detailContext.root.querySelector('[data-rental-summary]');
    if (summary) {
      summary.textContent = item.description || summary.textContent || '';
    }
    const cta = detailContext.root.querySelector('[data-rental-cta]');
    if (cta instanceof HTMLAnchorElement && item.cta_href) {
      cta.href = item.cta_href;
    }
  }

  function updateSections(item) {
    setText('[data-rental-description]', item.description || '');
    setText('[data-rental-address]', item.address || '');
  }

  function buildGalleryData(item) {
    const slides = [];
    if (item.image_1) {
      slides.push({ src: item.image_1, alt: item.image_1_alt || item.title, caption: item.image_1_alt || '' });
    }
    if (item.image_2) {
      slides.push({ src: item.image_2, alt: item.image_2_alt || item.title, caption: item.image_2_alt || '' });
    }
    return slides;
  }

  function setupGallery(gallery, galleryData, fallbackAlt) {
    if (!gallery) return;
    const viewport = gallery.querySelector('[data-gallery-viewport]');
    if (!viewport) return;

    let slides = Array.from(viewport.querySelectorAll('[data-gallery-item]'));
    const template = slides[0];
    const validData = (galleryData || []).filter((entry) => entry && entry.src);

    if (!validData.length) {
      const fallbackSlides = Array.from(viewport.querySelectorAll('[data-gallery-item]'));
      fallbackSlides.forEach((slide, idx) => {
        slide.removeAttribute('hidden');
        slide.classList.toggle('is-active', idx === 0);
      });
      initGalleryNavigation(gallery);
      return;
    }

    if (template && validData.length > slides.length) {
      for (let i = slides.length; i < validData.length; i++) {
        const clone = template.cloneNode(true);
        clone.classList.remove('is-active');
        viewport.appendChild(clone);
      }
      slides = Array.from(viewport.querySelectorAll('[data-gallery-item]'));
    }

    slides.forEach((slide, idx) => {
      const data = validData[idx];
      const img = slide.querySelector('[data-gallery-image]');
      const caption = slide.querySelector('[data-gallery-caption]');
      if (data) {
        if (img instanceof HTMLImageElement) {
          img.src = data.src;
          img.alt = data.alt || fallbackAlt || 'Ires ipa�ums';
          img.loading = 'lazy';
          img.decoding = 'async';
          img.width = img.width || 1280;
          img.height = img.height || 840;
        }
        if (caption) {
          caption.textContent = data.caption || '';
        }
        slide.removeAttribute('hidden');
      } else {
        slide.setAttribute('hidden', '');
      }
      slide.classList.remove('is-active');
    });

    const activeSlides = slides.filter((slide) => !slide.hasAttribute('hidden'));
    if (activeSlides.length) {
      activeSlides[0].classList.add('is-active');
    }

    initGalleryNavigation(gallery);
  }

  function initGalleryNavigation(gallery) {
    const slides = Array.from(gallery.querySelectorAll('[data-gallery-item]')).filter((slide) => !slide.hasAttribute('hidden'));
    const controlsWrapper = gallery.querySelector('[data-gallery-controls]');
    const prev = gallery.querySelector('[data-gallery-prev]');
    const next = gallery.querySelector('[data-gallery-next]');
    const dotsContainer = gallery.querySelector('[data-gallery-dots]');

    if (!slides.length) {
      controlsWrapper?.setAttribute('hidden', '');
      return;
    }

    const hasMultiple = slides.length > 1;
    if (controlsWrapper) {
      if (hasMultiple) controlsWrapper.removeAttribute('hidden');
      else controlsWrapper.setAttribute('hidden', '');
    }
    if (prev instanceof HTMLButtonElement) prev.disabled = !hasMultiple;
    if (next instanceof HTMLButtonElement) next.disabled = !hasMultiple;

    const state = gallery.__vhGallery || { index: 0 };
    state.index = Math.min(state.index, slides.length - 1);

    function show(nextIndex) {
      if (!slides.length) return;
      state.index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, idx) => {
        slide.classList.toggle('is-active', idx === state.index);
      });
      if (dotsContainer) {
        Array.from(dotsContainer.children).forEach((dot, idx) => {
          dot.classList.toggle('is-active', idx === state.index);
        });
      }
    }

    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      if (hasMultiple) {
        slides.forEach((slide, idx) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'vh-gallery__dot' + (idx === state.index ? ' is-active' : '');
          dot.setAttribute('aria-label', `Radit attelu ${idx + 1}`);
          dot.addEventListener('click', () => show(idx));
          dotsContainer.appendChild(dot);
        });
      }
    }

    if (hasMultiple) {
      if (!state.initialized) {
        prev?.addEventListener('click', () => show(state.index - 1));
        next?.addEventListener('click', () => show(state.index + 1));
        gallery.addEventListener('keydown', (event) => {
          if (event.key === 'ArrowRight') show(state.index + 1);
          if (event.key === 'ArrowLeft') show(state.index - 1);
        });
        state.initialized = true;
      }
    }

    show(state.index || 0);
    gallery.__vhGallery = state;
  }

  function renderRelated(current) {
    if (!detailContext.relatedGrid) return;
    const related = rentals.filter((item) => item.slug !== current.slug).slice(0, 3);
    detailContext.relatedGrid.innerHTML = '';
    const section = detailContext.relatedGrid.closest('[data-rental-related]');
    if (!related.length) {
      section?.setAttribute('hidden', '');
      return;
    }
    section?.removeAttribute('hidden');
    const fragment = document.createDocumentFragment();
    related.forEach((item) => fragment.appendChild(createCard(item)));
    detailContext.relatedGrid.appendChild(fragment);
  }

  function updateBackLink() {
    if (!detailContext.back) return;
    const url = buildListUrl('/rentals.html');
    detailContext.back.href = `${url}#rentals-grid`;
  }

  function setText(selector, value) {
    const element = detailContext.root?.querySelector(selector);
    if (!element) return;
    element.textContent = value || '';
  }

  function bootstrap() {
    appliedFilters = mergeFilters();
    persistFilters(appliedFilters);

    if (listContext.grid) {
      populateForm();
      renderChips();
      initListHandlers();
      updateFilterUrl(appliedFilters);
    } else if (detailContext.back) {
      updateBackLink();
    }
  }

  function hydrate() {
    if (listContext.grid) {
      renderList(applyFilters(rentals));
    }
    if (detailContext.root) {
      hydrateDetail();
    }
  }

  function init() {
    fetch(DATA_URL)
      .then((response) => response.json())
      .then((json) => {
        rentals = Array.isArray(json.rentals) ? json.rentals : [];
        hydrate();
      })
      .catch((error) => {
        console.error('Neizdevas ieladet ires datus', error);
        if (listContext.grid) {
          listContext.grid.innerHTML = '<div class="vh-empty">Neizdevas ieladet ires piedavajumus.</div>';
        }
        if (detailContext.root) {
          detailContext.root.innerHTML = '<div class="vh-empty">Neizdevas ieladet piedavajumu.</div>';
        }
      });
  }

  bootstrap();
  init();
})();



