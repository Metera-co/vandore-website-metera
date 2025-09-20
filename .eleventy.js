const fs = require('fs');
const path = require('path');

module.exports = function (eleventyConfig) {
  // Passthrough asset folders from project root
  eleventyConfig.addPassthroughCopy({ css: 'css' });
  eleventyConfig.addPassthroughCopy({ js: 'js' });
  eleventyConfig.addPassthroughCopy({ image: 'image' });
  eleventyConfig.addPassthroughCopy({ font: 'font' });
  eleventyConfig.addWatchTarget('./css');
  eleventyConfig.addWatchTarget('./js');
  eleventyConfig.addWatchTarget('./image');

  eleventyConfig.addFilter('numbersOnly', function (value) {
    if (value === undefined || value === null) {
      return '';
    }
    const raw = String(value);
    const normalized = raw.replace(/[^0-9.,]/g, '').replace(/,/g, '.');
    const parsed = parseFloat(normalized);
    if (!Number.isNaN(parsed)) {
      return parsed.toString();
    }
    const digits = raw.replace(/\D/g, '');
    return digits;
  });

  // Copy static HTML under pages/ to the site root so existing pages still deploy
  eleventyConfig.addPassthroughCopy({ pages: '.' });

  // Load page JSON documents under content/pages into a global map: pages[slug]
  const contentRoot = path.join(__dirname, 'content');
  const pagesDir = path.join(contentRoot, 'pages');
  const pagesMap = {};
  if (fs.existsSync(pagesDir)) {
    for (const file of fs.readdirSync(pagesDir)) {
      if (file.endsWith('.json')) {
        const slug = file.replace(/\.json$/, '');
        try {
          const raw = fs.readFileSync(path.join(pagesDir, file), 'utf8');
          pagesMap[slug] = JSON.parse(raw);
        } catch (e) {
          console.warn('Failed parsing page JSON:', file, e);
        }
      }
    }
  }
  eleventyConfig.addGlobalData('pages', pagesMap);

  // Build collection from property JSON files under content/properties
  eleventyConfig.addCollection('property', function () {
    const propertiesDir = path.join(contentRoot, 'properties');
    const items = [];
    if (fs.existsSync(propertiesDir)) {
      for (const file of fs.readdirSync(propertiesDir)) {
        if (file.endsWith('.json')) {
          const slug = file.replace(/\.json$/, '');
          try {
            const raw = fs.readFileSync(path.join(propertiesDir, file), 'utf8');
            const data = JSON.parse(raw);
            items.push({ fileSlug: slug, data, inputPath: path.join('content/properties', file) });
          } catch (e) {
            console.warn('Failed parsing property JSON:', file, e);
          }
        }
      }
    }
    return items;
  });

  // Build collection from rental JSON files under content/rentals
  eleventyConfig.addCollection('rental', function () {
    const rentalsDir = path.join(contentRoot, 'rentals');
    const items = [];
    if (fs.existsSync(rentalsDir)) {
      for (const file of fs.readdirSync(rentalsDir)) {
        if (file.endsWith('.json')) {
          const slug = file.replace(/\.json$/, '');
          try {
            const raw = fs.readFileSync(path.join(rentalsDir, file), 'utf8');
            const data = JSON.parse(raw);
            items.push({ fileSlug: slug, data, inputPath: path.join('content/rentals', file) });
          } catch (e) {
            console.warn('Failed parsing rental JSON:', file, e);
          }
        }
      }
    }
    return items;
  });

  return {
    dir: {
      input: 'content',
      output: '_site',
      includes: '_includes',
      data: '_data'
    },
    templateFormats: ['njk', 'html']
  };
};

