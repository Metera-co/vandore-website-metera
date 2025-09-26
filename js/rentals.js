(function () {
  const DATA_URL = '/data/rentals.json';
  const STORAGE_KEY = 'vh-rental-filters-v1';
  const CONFIG_ID = 'rental-filter-config';

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

  const filterConfig = readConfig(CONFIG_ID);
  const filterOptions = filterConfig.filters || {};
  const sortConfig = filterConfig.sort || {};
  const defaultSort = sortConfig.default || '';

  const defaultFilters = Object.freeze({
    location: '',
    priceRange: '',
    bedrooms: '',
    type: '',
    occupancy: '',
    sort: defaultSort
  });

  const chipLabels = {
    location: (value) => `Atrasanas vieta: ${value}`,
    priceRange: (value) => {
      const range = getPriceRange(value);
      return range ? `Cena: ${range.label}` : '';
    },
    bedrooms: (value) => `Gulamistabas: ${value}`,
    type: (value) => `Tips: ${getTypeLabel(value)}`,
    occupancy: (value) => `Viesi: ${value}`
  };

  let rentals = [];
  let appliedFilters = { ...defaultFilters };

  function readConfig(id) {
    const node = document.getElementById(id);
    if (!node) return {};
    try {
      const parsed = JSON.parse(node.textContent || '{}');
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch (error) {
      console.error('Neizdevas nolasit ires konfiguraciju', error);
    }
    return {};
  }

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

  function getPriceRange(value) {
    if (!filterOptions.priceRanges) return null;
    if (value == null || value === '') return null;
    const index = Number.parseInt(value, 10);
    if (Number.isNaN(index)) return null;
    return filterOptions.priceRanges[index] || null;
  }

  function getTypeLabel(value) {
    const types = filterOptions.types || [];
    const entry = types.find((type) => type.value === value);
    return entry ? entry.label : value;
  }

  function getPriceValue(item) {
    if (!item) return 0;
    if (typeof item.price === 'number') return item.price;
    return numericValue(item.price || item.priceLabel || 0);
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
      if (!value) return;
      if (defaultFilters[key] === value) return;
      params.set(key, value);
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
      if (!field) return;
      if (value == null || value === '') {
        field.value = defaultFilters[key] || '';
      } else {
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
    renderList(applyFilters(rentals));
  }

  function collectFormFilters(formData) {
    const nextFilters = { ...defaultFilters };
    Object.keys(nextFilters).forEach((key) => {
      const value = formData.get(key);
      if (value != null) {
        nextFilters[key] = String(value).trim();
      }
    });
    if (!nextFilters.sort) {
      nextFilters.sort = defaultSort;
    }
    return nextFilters;
  }

  function matchesLocation(item, value) {
    if (!value) return true;
    const search = normalize(value);
    const haystack = [item.title, item.address, item.location, item.city]
      .filter(Boolean)
      .map((part) => normalize(part))
      .join(' ');
    return haystack.includes(search);
  }

  function matchesPrice(item, value) {
    if (!value) return true;
    const range = getPriceRange(value);
    if (!range) return true;
    const price = getPriceValue(item);
    if (range.min != null && price < range.min) return false;
    if (range.max != null && price > range.max) return false;
    return true;
  }

  function matchesBedrooms(item, value) {
    if (!value) return true;
    const candidate = Number(item.bedrooms) || 0;
    if (value.endsWith('+')) {
      const threshold = Number.parseInt(value, 10) || 0;
      return candidate >= threshold;
    }
    const expected = Number.parseInt(value, 10) || 0;
    return candidate === expected;
  }

  function matchesType(item, value) {
    if (!value) return true;
    return normalize(item.type || '') === normalize(value);
  }

  function matchesOccupancy(item, value) {
    if (!value) return true;
    const occupancy = Number(item.occupancy || item.maxGuests || 0);
    if (value.endsWith('+')) {
      const threshold = Number.parseInt(value, 10) || 0;
      return occupancy >= threshold;
    }
    const expected = Number.parseInt(value, 10) || 0;
    if (!expected) return true;
    return occupancy === expected;
  }

  function applyFilters(items) {
    if (!Array.isArray(items)) return [];
    const filtered = items.filter((item) => {
      if (!matchesLocation(item, appliedFilters.location)) return false;
      if (!matchesPrice(item, appliedFilters.priceRange)) return false;
      if (!matchesBedrooms(item, appliedFilters.bedrooms)) return false;
      if (!matchesType(item, appliedFilters.type)) return false;
      if (!matchesOccupancy(item, appliedFilters.occupancy)) return false;
      return true;
    });
    return sortItems(filtered);
  }

  function getSortDate(item) {
    const source = item.availableFrom || item.updated || item.created || '';
    const time = Date.parse(source);
    if (Number.isNaN(time)) return 0;
    return time;
  }

  function baseOrder(item) {
    if (item && typeof item.__vhOrder === 'number') return item.__vhOrder;
    return 0;
  }

  function sortItems(items) {
    const activeSort = appliedFilters.sort || defaultSort;
    if (!activeSort) return items.slice();
    const sorted = items.slice();
    if (activeSort === 'price-asc' || activeSort === 'price-desc') {
      const factor = activeSort === 'price-asc' ? 1 : -1;
      sorted.sort((a, b) => {
        const diff = (getPriceValue(a) - getPriceValue(b)) * factor;
        if (diff === 0) return baseOrder(a) - baseOrder(b);
        return diff;
      });
      return sorted;
    }
    if (activeSort === 'newest') {
      sorted.sort((a, b) => {
        const diff = getSortDate(b) - getSortDate(a);
        if (diff === 0) return baseOrder(a) - baseOrder(b);
        return diff;
      });
      return sorted;
    }
    return sorted;
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
      if (total === 0) {
        listContext.count.textContent = 'Nav atrastu ires piedavajumu';
      } else if (total === 1) {
        listContext.count.textContent = '1 ires piedavajums atrasts';
      } else {
        listContext.count.textContent = `${formatNumber(total)} ires piedavajumi atrasti`;
      }
    }
  }

  function renderChips() {
    if (!listContext.chips) return;
    const activeEntries = Object.entries(appliedFilters)
      .filter(([key, value]) => key !== 'sort' && Boolean(value) && defaultFilters[key] !== value)
      .map(([key, value]) => {
        const labelFn = chipLabels[key];
        const label = labelFn ? labelFn(value) : `${key}: ${value}`;
        return { key, value, label };
      })
      .filter((entry) => Boolean(entry.label));

    listContext.chips.innerHTML = '';
    if (!activeEntries.length) {
      listContext.chips.setAttribute('hidden', '');
      return;
    }
    listContext.chips.removeAttribute('hidden');
    const fragment = document.createDocumentFragment();
    activeEntries.forEach(({ key, value, label }) => {
      const chip = document.createElement('span');
      chip.className = 'vh-chip';
      chip.dataset.filterKey = key;
      chip.dataset.filterValue = value;
      chip.textContent = label;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'vh-chip__remove';
      remove.setAttribute('aria-label', `Nonemt filtru ${label}`);
      remove.textContent = 'x';
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
    if (item.image) {
      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.image_alt || item.title || 'Ires piedavajums';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.width = 1200;
      img.height = 900;
      img.sizes = '(min-width: 1200px) 280px, (min-width: 992px) 32vw, (min-width: 768px) 45vw, 92vw';
      media.appendChild(img);
    }
    if (item.badge) {
      const badge = document.createElement('span');
      badge.className = 'vh-card__badge';
      badge.textContent = item.badge;
      media.appendChild(badge);
    }
    article.appendChild(media);

    const body = document.createElement('div');
    body.className = 'vh-card__body';

    const title = document.createElement('h3');
    title.className = 'vh-card__title';
    title.textContent = item.title || 'Ires piedavajums';
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
    if (item.area) meta.appendChild(createMetaChip(`${item.area} m2`));
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

  function rentalUrl(slug) {
    if (!slug) return '/rentals/';
    try {
      return `/rentals/${encodeURIComponent(slug)}/`;
    } catch (error) {
      return `/rentals/${slug}/`;
    }
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
    if (!key || !Object.prototype.hasOwnProperty.call(appliedFilters, key)) return;
    appliedFilters[key] = defaultFilters[key] || '';
    persistFilters(appliedFilters);
    populateForm();
    renderChips();
    updateFilterUrl(appliedFilters);
    renderList(applyFilters(rentals));
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
      renderList(applyFilters(rentals));
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
      if (!value) return;
      if (defaultFilters[key] === value) return;
      params.set(key, value);
    });
    const query = params.toString();
    return `${path}${query ? `?${query}` : ''}`;
  }

  function getRentalSlug() {
    if (detailContext.root && detailContext.root.dataset && detailContext.root.dataset.slug) {
      return detailContext.root.dataset.slug;
    }
    const match = window.location.pathname.match(/\/rentals\/([^/]+)\/?$/);
    if (match && match[1]) {
      try {
        return decodeURIComponent(match[1]);
      } catch (error) {
        return match[1];
      }
    }
    const params = new URLSearchParams(window.location.search);
    const querySlug = params.get('slug');
    if (querySlug) {
      try {
        return decodeURIComponent(querySlug);
      } catch (error) {
        return querySlug;
      }
    }
    return null;
  }

  function hydrateDetail() {
    if (!detailContext.root) return;
    const slug = getRentalSlug();
    const item = slug ? rentals.find((entry) => entry.slug === slug) : null;

    if (!item) {
      detailContext.root.innerHTML = '<div class="vh-empty">Piedavajums nav atrasts.</div>';
      if (detailContext.back) {
        detailContext.back.href = buildListUrl('/rentals.html');
      }
      return;
    }

    detailContext.root.dataset.slug = item.slug || '';
    updateHero(item);
    updateSpecs(item);
    updateSections(item);
    setupGallery(detailContext.root.querySelector('[data-rental-gallery]'), Array.isArray(item.gallery) ? item.gallery : [], item.title);
    renderRelated(item);
    updateBackLink();
  }

  function updateHero(item) {
    const heroImage = detailContext.root.querySelector('[data-rental-hero-image]');
    if (heroImage instanceof HTMLImageElement) {
      if (item.image) {
        heroImage.src = item.image;
      }
      heroImage.alt = item.image_alt || item.title || 'Ires piedavajums';
      heroImage.width = heroImage.width || 1440;
      heroImage.height = heroImage.height || 900;
    }
    setText('[data-rental-title]', item.title || 'Ires piedavajums');
    setText('[data-rental-price]', item.price || '');
    setText('[data-rental-location]', item.address || '');
  }

  function updateSpecs(item) {
    setText('[data-rental-bedrooms]', item.bedrooms != null ? String(item.bedrooms) : 'ï¿½');
    setText('[data-rental-bathrooms]', item.bathrooms != null ? String(item.bathrooms) : 'ï¿½');
    setText('[data-rental-area]', item.area ? `${item.area} m2` : 'ï¿½');
    setText('[data-rental-occupancy]', item.occupancy || item.maxGuests || 'ï¿½');
  }

  function updateSections(item) {
    const description = detailContext.root.querySelector('[data-rental-description]');
    if (description) {
      description.textContent = item.description || '';
    }
  }

  function setText(selector, value) {
    const element = detailContext.root?.querySelector(selector);
    if (!element) return;
    element.textContent = value || '';
  }

  function setupGallery(gallery, slides, title) {
    if (!gallery) return;
    const viewport = gallery.querySelector('[data-gallery-viewport]');
    const controlsWrapper = gallery.querySelector('[data-gallery-controls]');
    const prev = gallery.querySelector('[data-gallery-prev]');
    const next = gallery.querySelector('[data-gallery-next]');
    const dotsContainer = gallery.querySelector('[data-gallery-dots]');

    if (!viewport) return;
    viewport.innerHTML = '';
    slides.forEach((slide, index) => {
      const figure = document.createElement('figure');
      figure.className = 'vh-gallery__slide' + (index === 0 ? ' is-active' : '');
      figure.dataset.galleryItem = '';
      const img = document.createElement('img');
      img.src = slide.src;
      img.alt = slide.alt || title || 'Ires attels';
      img.loading = 'lazy';
      img.decoding = 'async';
      figure.appendChild(img);
      if (slide.caption) {
        const caption = document.createElement('figcaption');
        caption.className = 'vh-gallery__caption';
        caption.textContent = slide.caption;
        figure.appendChild(caption);
      }
      viewport.appendChild(figure);
    });

    const slideNodes = Array.from(viewport.children);
    const hasMultiple = slideNodes.length > 1;

    if (controlsWrapper) {
      if (hasMultiple) controlsWrapper.removeAttribute('hidden');
      else controlsWrapper.setAttribute('hidden', '');
    }
    if (prev instanceof HTMLButtonElement) prev.disabled = !hasMultiple;
    if (next instanceof HTMLButtonElement) next.disabled = !hasMultiple;

    const state = gallery.__vhGallery || { index: 0 };
    state.index = Math.min(state.index, slideNodes.length - 1);

    function show(nextIndex) {
      if (!slideNodes.length) return;
      state.index = (nextIndex + slideNodes.length) % slideNodes.length;
      slideNodes.forEach((slide, idx) => {
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
        slideNodes.forEach((_, idx) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'vh-gallery__dot' + (idx === state.index ? ' is-active' : '');
          dot.setAttribute('aria-label', `Radit attelu ${idx + 1}`);
          dot.addEventListener('click', () => show(idx));
          dotsContainer.appendChild(dot);
        });
      }
    }

    if (hasMultiple && !state.initialized) {
      prev?.addEventListener('click', () => show(state.index - 1));
      next?.addEventListener('click', () => show(state.index + 1));
      gallery.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight') show(state.index + 1);
        if (event.key === 'ArrowLeft') show(state.index - 1);
      });
      state.initialized = true;
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
        rentals.forEach((item, index) => {
          if (item && typeof item === 'object' && !Object.prototype.hasOwnProperty.call(item, '__vhOrder')) {
            Object.defineProperty(item, '__vhOrder', {
              value: index,
              enumerable: false
            });
          }
        });
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

