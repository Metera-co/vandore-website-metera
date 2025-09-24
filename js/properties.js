(function () {
  const DATA_URL = '/data/properties.json';
  const STORAGE_KEY = 'vh-property-filters-v1';

  const listContext = {
    grid: document.getElementById('property-grid'),
    count: document.getElementById('property-count'),
    chips: document.getElementById('property-filter-chips'),
    empty: document.getElementById('property-empty'),
    emptyReset: document.getElementById('property-empty-reset'),
    form: document.getElementById('property-filter-form')
  };

  const detailContext = {
    root: document.querySelector('[data-property-detail]'),
    back: document.querySelector('[data-property-back]'),
    relatedGrid: document.getElementById('property-related-grid')
  };

  const defaultFilters = Object.freeze({
    location: '',
    priceMin: '',
    priceMax: '',
    bedrooms: '',
    areaMin: ''
  });

  const chipLabels = {
    location: (value) => `Atrašanas vieta: ${value}`,
    priceMin: (value) => `Cena no ${formatNumber(value)} €`,
    priceMax: (value) => `Cena lidz ${formatNumber(value)} €`,
    bedrooms: (value) => Number(value) >= 4 ? 'Gulamistabas: 4+' : `Gulamistabas: ${value}`,
    areaMin: (value) => `Platiba no ${formatNumber(value)} m²`
  };

  let properties = [];
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

  function propertyUrl(slug) {
    const params = new URLSearchParams(window.location.search);
    params.set('slug', slug);
    return `property.html?${params.toString()}`;
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
      console.warn('Neizdevas nolasit saglabatos filtrus', error);
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
      console.warn('Neizdevas saglabat filtrus', error);
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
    if (nextFilters.bedrooms === '4+') {
      nextFilters.bedrooms = '4';
    }
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
        const bedrooms = Number.parseInt(appliedFilters.bedrooms, 10) || 0;
        const candidate = Number(item.bedrooms) || 0;
        if (bedrooms >= 4) {
          if (candidate < bedrooms) return false;
        } else if (candidate !== bedrooms) {
          return false;
        }
      }
      if (appliedFilters.areaMin) {
        if ((Number(item.area) || 0) < (Number(appliedFilters.areaMin) || 0)) {
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
      const label = total === 1 ? '1 ipašums atrasts' : `${formatNumber(total)} ipašumi atrasti`;
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
      remove.textContent = '×';
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
      img.alt = item.image_alt || item.title || 'Ipašuma attels';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.width = 1200;
      img.height = 900;
      img.sizes = '(min-width: 1200px) 280px, (min-width: 992px) 32vw, (min-width: 768px) 45vw, 92vw';
      media.appendChild(img);
    }
    const badgeText = item.badge || 'Pardošana';
    if (badgeText) {
      const badge = document.createElement('span');
      badge.className = 'vh-card__badge';
      badge.textContent = badgeText;
      media.appendChild(badge);
    }
    article.appendChild(media);

    const body = document.createElement('div');
    body.className = 'vh-card__body';

    const title = document.createElement('h3');
    title.className = 'vh-card__title';
    title.textContent = item.title || 'Ipašuma piedavajums';
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
    if (item.area) meta.appendChild(createMetaChip(`${item.area} m²`));
    if (item.bedrooms) meta.appendChild(createMetaChip(`${item.bedrooms} gulamist.`));
    if (item.bathrooms) meta.appendChild(createMetaChip(`${item.bathrooms} vann.`));
    body.appendChild(meta);

    const cta = document.createElement('div');
    cta.className = 'vh-card__cta';
    const link = document.createElement('a');
    link.className = 'vh-button vh-button--primary';
    link.href = propertyUrl(item.slug || '');
    link.rel = 'bookmark';
    link.textContent = 'Skatit ipašumu';
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
    const item = slug ? properties.find((entry) => entry.slug === slug) : properties[0];

    if (!item) {
      detailContext.root.innerHTML = '<div class="vh-empty">Ipašums nav atrasts.</div>';
      if (detailContext.back) {
        detailContext.back.href = '/properties.html';
      }
      return;
    }

    updateHero(item);
    updateSpecs(item);
    updateSections(item);
    setupGallery(detailContext.root.querySelector('[data-property-gallery]'), Array.isArray(item.gallery) ? item.gallery : [], item.title);
    renderRelated(item);
    updateBackLink();
  }

  function updateHero(item) {
    const heroImage = detailContext.root.querySelector('[data-property-hero-image]');
    if (heroImage instanceof HTMLImageElement) {
      if (item.image) {
        heroImage.src = item.image;
      }
      heroImage.alt = item.image_alt || item.title || 'Ipašums';
      heroImage.width = heroImage.width || 1440;
      heroImage.height = heroImage.height || 900;
    }
    setText('[data-property-badge]', item.badge || 'Pardošana');
    setText('[data-property-title]', item.title || 'Ipašuma piedavajums');
    setText('[data-property-price]', item.price || '');
    setText('[data-property-location]', item.address || '');
  }

  function updateSpecs(item) {
    setText('[data-property-area]', item.area ? `${item.area} m²` : '—');
    setText('[data-property-bedrooms]', item.bedrooms != null ? String(item.bedrooms) : '—');
    setText('[data-property-bathrooms]', item.bathrooms != null ? String(item.bathrooms) : '—');
    setText('[data-property-floors]', item.floors != null ? String(item.floors) : '—');
    const summary = detailContext.root.querySelector('[data-property-summary]');
    if (summary) {
      summary.textContent = item.description || summary.textContent || '';
    }
  }

  function updateSections(item) {
    setText('[data-property-description]', item.description || '');
    setText('[data-property-address]', item.address || '');
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
          img.alt = data.alt || fallbackAlt || 'Ipašuma attels';
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
          if (event.key === 'ArrowRight') {
            show(state.index + 1);
          } else if (event.key === 'ArrowLeft') {
            show(state.index - 1);
          }
        });
        state.initialized = true;
      }
    }

    show(state.index || 0);
    gallery.__vhGallery = state;
  }

  function renderRelated(current) {
    if (!detailContext.relatedGrid) return;
    const related = properties.filter((item) => item.slug !== current.slug).slice(0, 3);
    detailContext.relatedGrid.innerHTML = '';
    const section = detailContext.relatedGrid.closest('[data-property-related]');
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
    const url = buildListUrl('/properties.html');
    detailContext.back.href = `${url}#property-grid`;
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
      renderList(applyFilters(properties));
    }
    if (detailContext.root) {
      hydrateDetail();
    }
  }

  function init() {
    fetch(DATA_URL)
      .then((response) => response.json())
      .then((json) => {
        properties = Array.isArray(json.properties) ? json.properties : [];
        hydrate();
      })
      .catch((error) => {
        console.error('Neizdevas ieladet ipašumu datus', error);
        if (listContext.grid) {
          listContext.grid.innerHTML = '<div class="vh-empty">Neizdevas ieladet ipašumus.</div>';
        }
        if (detailContext.root) {
          detailContext.root.innerHTML = '<div class="vh-empty">Neizdevas ieladet ipašuma datus.</div>';
        }
      });
  }

  bootstrap();
  init();
})();



