(function () {
  const gallery = document.querySelector('[data-listing-gallery]');
  if (!gallery) return;

  const mainImage = gallery.querySelector('[data-gallery-main]');
  const captionEl = gallery.querySelector('[data-gallery-caption]');
  const thumbButtons = Array.from(gallery.querySelectorAll('[data-gallery-index]'));
  const images = Array.isArray(window.galleryImages) ? window.galleryImages : [];

  function setActive(index) {
    if (!mainImage) return;
    const image = images[index];
    if (!image) return;

    mainImage.src = image.src;
    mainImage.alt = image.alt || '';

    if (captionEl) {
      captionEl.textContent = image.caption || '';
      captionEl.classList.toggle('d-none', !image.caption);
    }

    thumbButtons.forEach((button) => {
      if (!(button instanceof HTMLElement)) return;
      const btnIndex = Number(button.dataset.galleryIndex);
      if (Number.isNaN(btnIndex)) return;
      if (btnIndex === index) {
        button.classList.add('is-active');
      } else {
        button.classList.remove('is-active');
      }
    });
  }

  thumbButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.galleryIndex);
      if (!Number.isNaN(index)) {
        setActive(index);
      }
    });
  });

  if (images.length) {
    setActive(0);
  }
})();
