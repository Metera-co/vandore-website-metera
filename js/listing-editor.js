(function () {
  const manager = document.querySelector('[data-image-manager]');
  if (!manager) return;

  const listEl = manager.querySelector('#imageList');
  const stateInput = document.getElementById('imageState');
  const countEl = manager.querySelector('[data-image-count]');
  const form = manager.closest('form');
  const maxImages = typeof window.maxImages === 'number' ? window.maxImages : 12;

  let images = Array.isArray(window.initialImageState) ? window.initialImageState.slice() : [];
  images = images
    .filter(Boolean)
    .map((image) => ({
      id: image.id,
      src: image.src,
      alt: image.alt || '',
      caption: image.caption || '',
    }))
    .filter((image) => image.id && image.src);

  function syncState() {
    if (stateInput) {
      stateInput.value = JSON.stringify(images);
    }
    if (countEl) {
      countEl.textContent = images.length;
    }
  }

  function render() {
    if (!listEl) return;
    listEl.innerHTML = '';

    if (!images.length) {
      const empty = document.createElement('div');
      empty.className = 'alert alert-info mb-0';
      empty.textContent = 'Šobrīd nav pievienotu attēlu.';
      listEl.appendChild(empty);
      syncState();
      return;
    }

    images.forEach((image, index) => {
      const item = document.createElement('li');
      item.className = 'image-manager__item border rounded-3 overflow-hidden';
      item.dataset.index = String(index);

      item.innerHTML = `
        <div class="row g-0">
          <div class="col-sm-4">
            <div class="ratio ratio-4x3 image-manager__thumb">
              <img src="${image.src}" alt="${image.alt || ''}" class="w-100 h-100 object-fit-cover">
            </div>
          </div>
          <div class="col-sm-8">
            <div class="p-3 d-flex flex-column gap-3">
              <div>
                <label class="form-label text-uppercase small fw-semibold mb-1">Alt teksts</label>
                <input type="text" class="form-control" data-role="alt" value="${escapeHtml(image.alt)}" maxlength="180">
              </div>
              <div>
                <label class="form-label text-uppercase small fw-semibold mb-1">Paraksts</label>
                <input type="text" class="form-control" data-role="caption" value="${escapeHtml(image.caption)}" maxlength="280">
              </div>
              <div class="d-flex gap-2 flex-wrap">
                <button class="btn btn-outline-secondary btn-sm" type="button" data-action="move" data-direction="up" ${index === 0 ? 'disabled' : ''}>Augšup</button>
                <button class="btn btn-outline-secondary btn-sm" type="button" data-action="move" data-direction="down" ${index === images.length - 1 ? 'disabled' : ''}>Lejup</button>
                <button class="btn btn-outline-danger btn-sm ms-auto" type="button" data-action="remove">Noņemt</button>
              </div>
            </div>
          </div>
        </div>
      `;

      listEl.appendChild(item);
    });

    syncState();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  listEl?.addEventListener('input', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    const role = target.dataset.role;
    if (!role) return;

    const item = target.closest('[data-index]');
    if (!item) return;
    const index = Number(item.dataset.index);
    if (Number.isNaN(index) || !images[index]) return;

    images[index][role] = target.value;
    syncState();
  });

  listEl?.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const item = button.closest('[data-index]');
    if (!item) return;
    const index = Number(item.dataset.index);
    if (Number.isNaN(index) || !images[index]) return;

    const action = button.dataset.action;
    if (action === 'remove') {
      images.splice(index, 1);
      render();
      return;
    }

    if (action === 'move') {
      const direction = button.dataset.direction === 'up' ? -1 : 1;
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= images.length) return;
      const temp = images[index];
      images[index] = images[nextIndex];
      images[nextIndex] = temp;
      render();
    }
  });

  form?.addEventListener('submit', () => {
    syncState();
    const totalUploads = form.querySelector('#images');
    if (totalUploads && totalUploads.files && totalUploads.files.length + images.length > maxImages) {
      alert(`Maksimālais attēlu skaits ir ${maxImages}. Lūdzu, noņemiet liekos attēlus.`);
    }
  }, { capture: true });

  render();
})();
