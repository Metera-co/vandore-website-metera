document.addEventListener('DOMContentLoaded', function () {
  // ------------------ Properties page filters ------------------
  const propertyGrid = document.getElementById('property-grid');
  if (propertyGrid) {
    const applyFiltersBtn = document.getElementById('apply-filters');
    const clearFiltersBtn = document.getElementById('clear-filters');
    const locationSearch = document.getElementById('location-search');
    const minPrice = document.getElementById('min-price');
    const maxPrice = document.getElementById('max-price');
    const bedroomBtns = document.querySelectorAll('.filter-bar.d-lg-block .btn-group .btn');
    const bedroomsSelectProp = document.getElementById('bedrooms-prop');
    const filterChips = document.getElementById('filter-chips');
    const propertyCount = document.getElementById('property-count');
    const propertyCards = Array.from(propertyGrid.querySelectorAll('.col.mb-4'));
    const emptyState = document.getElementById('empty-state');
    const clearFiltersLink = document.getElementById('clear-filters-link');

    const applyFiltersBtnMobile = document.getElementById('apply-filters-mobile');
    const clearFiltersBtnMobile = document.getElementById('clear-filters-mobile');
    const locationSearchMobile = document.getElementById('location-search-mobile');
    const minPriceMobile = document.getElementById('min-price-mobile');
    const maxPriceMobile = document.getElementById('max-price-mobile');
    const bedroomBtnsMobile = document.querySelectorAll('#filter-drawer .btn-group .btn');

    let activeFilters = {};
    let inputTimer;
    function debounce(fn, delay) {
      clearTimeout(inputTimer);
      inputTimer = setTimeout(fn, delay);
    }

    function applyFilters(isMobile = false) {
      activeFilters = {};

      const location = (isMobile ? locationSearchMobile?.value : locationSearch?.value) || '';
      const loc = location.trim().toLowerCase();
      if (loc) activeFilters.location = loc;

      const min = parseFloat((isMobile ? minPriceMobile?.value : minPrice?.value) || '');
      const max = parseFloat((isMobile ? maxPriceMobile?.value : maxPrice?.value) || '');
      if (!isNaN(min) && !isNaN(max) && min > max) {
        alert('Minimālā cena nevar būt lielāka par maksimālo cenu.');
        return;
      }
      if (!isNaN(min)) activeFilters.minPrice = min;
      if (!isNaN(max)) activeFilters.maxPrice = max;

      const btns = isMobile ? bedroomBtnsMobile : bedroomBtns;
      if (btns && btns.length) {
        btns.forEach(btn => {
          if (btn.classList.contains('active')) {
            const raw = (btn.dataset.value || btn.textContent || '').trim();
            const val = raw.toLowerCase();
            if (val !== 'all' && val !== 'viss' && val !== '') {
              activeFilters.bedrooms = raw;
            }
          }
        });
      }
      // Fallback to select if present
      if (!activeFilters.bedrooms && bedroomsSelectProp) {
        const raw = (bedroomsSelectProp.value || '').trim();
        if (raw) activeFilters.bedrooms = raw;
      }

      renderChips();
      filterProperties();
    }

    function clearFilters(isMobile = false) {
      if (isMobile) {
        if (locationSearchMobile) locationSearchMobile.value = '';
        if (minPriceMobile) minPriceMobile.value = '';
        if (maxPriceMobile) maxPriceMobile.value = '';
        bedroomBtnsMobile.forEach(btn => btn.classList.remove('active'));
        if (bedroomBtnsMobile[0]) bedroomBtnsMobile[0].classList.add('active');
      } else {
        if (locationSearch) locationSearch.value = '';
        if (minPrice) minPrice.value = '';
        if (maxPrice) maxPrice.value = '';
        bedroomBtns.forEach(btn => btn.classList.remove('active'));
        if (bedroomBtns[0]) bedroomBtns[0].classList.add('active');
      }

      activeFilters = {};
      renderChips();
      filterProperties();
    }

    function removeFilter(key) {
      delete activeFilters[key];
      if (key === 'minPrice') {
        if (minPrice) minPrice.value = '';
        if (minPriceMobile) minPriceMobile.value = '';
      }
      if (key === 'maxPrice') {
        if (maxPrice) maxPrice.value = '';
        if (maxPriceMobile) maxPriceMobile.value = '';
      }
      if (key === 'location') {
        if (locationSearch) locationSearch.value = '';
        if (locationSearchMobile) locationSearchMobile.value = '';
      }
      if (key === 'bedrooms') {
        bedroomBtns.forEach(btn => btn.classList.remove('active'));
        if (bedroomBtns[0]) bedroomBtns[0].classList.add('active');
        bedroomBtnsMobile.forEach(btn => btn.classList.remove('active'));
        if (bedroomBtnsMobile[0]) bedroomBtnsMobile[0].classList.add('active');
        if (bedroomsSelectProp) bedroomsSelectProp.value = '';
      }

      renderChips();
      filterProperties();
    }

    function renderChips() {
      if (!filterChips) return;
      filterChips.innerHTML = '';
      for (const key in activeFilters) {
        const chip = document.createElement('span');
        chip.className = 'chip';
        let text = '';
        if (key === 'minPrice') text = `Min: €${activeFilters[key]}`;
        else if (key === 'maxPrice') text = `Max: €${activeFilters[key]}`;
        else text = `${key.charAt(0).toUpperCase() + key.slice(1)}: ${activeFilters[key]}`;
        chip.innerHTML = `${text} <span class="remove-chip" data-filter="${key}">&times;</span>`;
        filterChips.appendChild(chip);
      }
      document.querySelectorAll('.remove-chip').forEach(chip => {
        chip.addEventListener('click', (e) => removeFilter(e.target.dataset.filter));
      });
    }

    function filterProperties() {
      let count = 0;
      propertyCards.forEach(card => {
        let show = true;
        const cardLocation = (card.dataset.location || '').toLowerCase();
        const cardPrice = parseFloat(card.dataset.price) || 0;
        const cardBedrooms = parseInt(card.dataset.bedrooms, 10) || 0;

        if (activeFilters.location && !cardLocation.includes(activeFilters.location)) show = false;
        if (activeFilters.minPrice && cardPrice < activeFilters.minPrice) show = false;
        if (activeFilters.maxPrice && cardPrice > activeFilters.maxPrice) show = false;

        if (activeFilters.bedrooms) {
          const bedroomFilter = activeFilters.bedrooms;
          const requiredBedrooms = parseInt(bedroomFilter.replace('+', ''), 10);
          if (activeFilters.bedrooms.includes('+')) {
            if (cardBedrooms < requiredBedrooms) show = false;
          } else {
            if (cardBedrooms !== requiredBedrooms) show = false;
          }
        }

        card.style.display = show ? 'block' : 'none';
        if (show) count++;
      });

      if (propertyCount) {
        propertyCount.textContent = `${count} īpašumi atrasti`;
        propertyCount.setAttribute('aria-live', 'polite');
      }

      if (emptyState) {
        if (count === 0) {
          emptyState.style.display = 'block';
          propertyGrid.style.display = 'none';
        } else {
          emptyState.style.display = 'none';
          propertyGrid.style.display = 'flex';
        }
      }
    }

    if (applyFiltersBtn) applyFiltersBtn.addEventListener('click', () => applyFilters());
    if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', () => clearFilters());
    if (clearFiltersLink) clearFiltersLink.addEventListener('click', (e) => { e.preventDefault(); clearFilters(); });
    if (locationSearch) locationSearch.addEventListener('keyup', () => debounce(() => applyFilters(), 300));
    if (applyFiltersBtnMobile) applyFiltersBtnMobile.addEventListener('click', () => {
      applyFilters(true);
      const drawer = bootstrap.Offcanvas.getInstance(document.getElementById('filter-drawer'));
      if (drawer) drawer.hide();
    });
    if (clearFiltersBtnMobile) clearFiltersBtnMobile.addEventListener('click', () => clearFilters(true));
    if (locationSearchMobile) locationSearchMobile.addEventListener('keyup', () => debounce(() => applyFilters(true), 300));
    [bedroomBtns, bedroomBtnsMobile].forEach(btns => {
      if (btns && btns.forEach) {
        btns.forEach(btn => {
          btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
          });
        });
      }
    });
    if (bedroomsSelectProp) bedroomsSelectProp.addEventListener('change', () => applyFilters());
    // Initial load
    applyFilters();
  }

  // ------------------ Rentals page filters ------------------
  const rentalsGrid = document.getElementById('rentals-grid');
  if (rentalsGrid) {
    const rentalsCards = Array.from(rentalsGrid.querySelectorAll('.col'));
    const locationInput = document.getElementById('location');
    const minInput = document.getElementById('price-min');
    const maxInput = document.getElementById('price-max');
    const bedroomsSelect = document.getElementById('bedrooms');
    const typeSelect = document.getElementById('rent-type');
    const countEl = document.getElementById('rentals-count');

    const state = { location: '', min: undefined, max: undefined, bedrooms: '', type: '' };
    let t;
    const debounce2 = (fn) => { clearTimeout(t); t = setTimeout(fn, 250); };

    function readState() {
      state.location = (locationInput?.value || '').trim().toLowerCase();
      const min = parseFloat(minInput?.value);
      const max = parseFloat(maxInput?.value);
      state.min = isNaN(min) ? undefined : min;
      state.max = isNaN(max) ? undefined : max;
      state.bedrooms = (bedroomsSelect?.value || '').trim();
      state.type = (typeSelect?.value || '').trim();
    }

    function applyRentalsFilters() {
      readState();
      let count = 0;
      rentalsCards.forEach(card => {
        const loc = (card.dataset.location || '').toLowerCase();
        const price = parseFloat(card.dataset.price) || 0;
        const beds = parseInt(card.dataset.bedrooms || '0', 10) || 0;
        const type = (card.dataset.type || '').toLowerCase();
        let show = true;
        if (state.location && !loc.includes(state.location)) show = false;
        if (state.min !== undefined && price < state.min) show = false;
        if (state.max !== undefined && price > state.max) show = false;
        if (state.bedrooms) {
          if (state.bedrooms.includes('+')) {
            const n = parseInt(state.bedrooms.replace('+',''), 10) || 0;
            if (beds < n) show = false;
          } else {
            const n = parseInt(state.bedrooms, 10) || 0;
            if (beds !== n) show = false;
          }
        }
        if (state.type && type !== state.type) show = false;
        card.style.display = show ? '' : 'none';
        if (show) count++;
      });
      if (countEl) countEl.textContent = `${count} īres atrastas`;
    }

    if (locationInput) locationInput.addEventListener('keyup', () => debounce2(applyRentalsFilters));
    if (minInput) minInput.addEventListener('input', () => applyRentalsFilters());
    if (maxInput) maxInput.addEventListener('input', () => applyRentalsFilters());
    if (bedroomsSelect) bedroomsSelect.addEventListener('change', () => applyRentalsFilters());
    if (typeSelect) typeSelect.addEventListener('change', () => applyRentalsFilters());
    applyRentalsFilters();
  }
});
