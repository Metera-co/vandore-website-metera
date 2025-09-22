(function () {
  const blogList = document.getElementById('blog-grid');
  const blogDetail = document.getElementById('blog-detail');
  let posts = [];

  function dataPath(name) {
    return `/data/${name}`;
  }

  function blogUrl(slug) {
    return `/single_blog.html?slug=${encodeURIComponent(slug)}`;
  }

  function formatDate(value) {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString('lv-LV', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function createCard(post) {
    const col = document.createElement('div');
    col.className = 'col';

    const article = document.createElement('article');
    article.className = 'card h-100 border-0 shadow-sm overflow-hidden';

    if (post.image) {
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.src = post.image;
      img.alt = post.image_alt || post.title;
      img.className = 'card-img-top';
      article.appendChild(img);
    }

    const body = document.createElement('div');
    body.className = 'card-body d-flex flex-column p-4';

    const meta = document.createElement('p');
    meta.className = 'text-muted small mb-2';
    const segments = [formatDate(post.date), post.readingTime, post.author].filter(Boolean);
    meta.textContent = segments.join(' • ');
    body.appendChild(meta);

    const title = document.createElement('h3');
    title.className = 'h5 mb-3';
    title.textContent = post.title;
    body.appendChild(title);

    if (post.summary) {
      const summary = document.createElement('p');
      summary.className = 'text-muted flex-grow-1';
      summary.textContent = post.summary;
      body.appendChild(summary);
    }

    const footer = document.createElement('div');
    footer.className = 'd-flex justify-content-between align-items-center mt-auto';

    const author = document.createElement('span');
    author.className = 'text-muted small';
    author.textContent = post.author || '';
    footer.appendChild(author);

    const link = document.createElement('a');
    link.className = 'btn btn-outline-secondary btn-sm';
    link.href = blogUrl(post.slug);
    link.textContent = 'Lasīt vairāk';
    footer.appendChild(link);

    body.appendChild(footer);
    article.appendChild(body);
    col.appendChild(article);
    return col;
  }

  function renderList(items) {
    if (!blogList) return;
    blogList.innerHTML = '';
    items.forEach(post => blogList.appendChild(createCard(post)));
  }

  function renderDetail(post) {
    if (!blogDetail) return;
    if (!post) {
      blogDetail.innerHTML = '<div class="alert alert-warning">Raksts nav atrasts.</div>';
      return;
    }

    const pieces = [formatDate(post.date), post.readingTime, post.author].filter(Boolean).join(' • ');
    const paragraphs = Array.isArray(post.content)
      ? post.content.map(text => `<p class="mb-4">${text}</p>`).join('')
      : '';

    blogDetail.innerHTML = `
      <header class="mb-5">
        <p class="text-muted">${pieces}</p>
        <h1 class="display-5 fw-semibold">${post.title}</h1>
      </header>
      ${post.image ? `<figure class="mb-5"><img class="img-fluid rounded-4" loading="lazy" src="${post.image}" alt="${post.image_alt || post.title}"></figure>` : ''}
      ${paragraphs}
      <div class="mt-5">
        <a class="btn btn-outline-secondary" href="/blog.html">Atpakaļ uz blogu</a>
      </div>
    `;
  }

  fetch(dataPath('blogs.json'))
    .then(res => res.json())
    .then(json => {
      posts = Array.isArray(json.blogs) ? json.blogs : [];
      if (blogList) renderList(posts);
      if (blogDetail) {
        const slug = new URLSearchParams(window.location.search).get('slug');
        const selected = posts.find(post => post.slug === slug) || posts[0];
        renderDetail(selected);
      }
    })
    .catch(() => {
      if (blogList) {
        blogList.innerHTML = '<div class="alert alert-warning w-100">Neizdevās ielādēt rakstus.</div>';
      }
    });
})();




