(() => {
  function initGallery(root) {
    const featuredImg = root.querySelector('[data-gallery-current]');
    const thumbButtons = Array.from(root.querySelectorAll('.property-gallery__thumb'));
    const prevBtn = root.querySelector('[data-gallery-prev]');
    const nextBtn = root.querySelector('[data-gallery-next]');

    if (!featuredImg || thumbButtons.length === 0) {
      return;
    }

    const images = thumbButtons.map((button) => {
      const img = button.querySelector('img');
      return {
        src: img?.dataset.full || img?.getAttribute('src') || '',
        srcset: img?.getAttribute('srcset') || '',
        sizes: img?.getAttribute('sizes') || '',
        alt: img?.getAttribute('alt') || ''
      };
    }).filter((item) => item.src);

    if (!images.length) {
      return;
    }

    let currentIndex = 0;

    function updateFeatured(index) {
      currentIndex = (index + images.length) % images.length;
      const { src, srcset, sizes, alt } = images[currentIndex];

      if (src && featuredImg.getAttribute('src') !== src) {
        featuredImg.setAttribute('src', src);
      }

      if (srcset) {
        featuredImg.setAttribute('srcset', srcset);
      } else {
        featuredImg.removeAttribute('srcset');
      }

      if (sizes) {
        featuredImg.setAttribute('sizes', sizes);
      } else {
        featuredImg.removeAttribute('sizes');
      }

      if (alt) {
        featuredImg.setAttribute('alt', alt);
      }

      thumbButtons.forEach((button, idx) => {
        const isActive = idx === currentIndex;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      featuredImg.setAttribute('data-gallery-index', String(currentIndex));
    }

    function showPrevious() {
      updateFeatured(currentIndex - 1);
    }

    function showNext() {
      updateFeatured(currentIndex + 1);
    }

    thumbButtons.forEach((button, index) => {
      button.addEventListener('click', () => updateFeatured(index));
      button.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          updateFeatured(index);
        }
      });
    });

    prevBtn?.addEventListener('click', showPrevious);
    nextBtn?.addEventListener('click', showNext);

    root.addEventListener('keydown', (event) => {
      if (event.target instanceof HTMLElement) {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          showPrevious();
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          showNext();
        }
      }
    });

    updateFeatured(0);
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-property-gallery]').forEach((gallery) => {
      initGallery(gallery);
    });
  });
})();
