const fs = require('fs');
const path = require('path');

function loadCollectionFromDir(dirName) {
  const dirPath = path.join(__dirname, 'content', dirName);
  if (!fs.existsSync(dirPath)) return [];

  const entries = fs
    .readdirSync(dirPath)
    .filter((file) => path.extname(file).toLowerCase() === '.json')
    .map((file) => {
      const fullPath = path.join(dirPath, file);
      let raw = fs.readFileSync(fullPath, 'utf8');
      if (raw.charCodeAt(0) === 0xfeff) {
        raw = raw.slice(1);
      }
      const data = JSON.parse(raw);
      if (!data.slug) {
        data.slug = path.basename(file, path.extname(file));
      }
      data.__source = path.join('content', dirName, file);
      return data;
    });

  if (dirName === 'blog') {
    return entries.sort((a, b) => {
      const aDate = Date.parse(a.date || a.published || 0) || 0;
      const bDate = Date.parse(b.date || b.published || 0) || 0;
      return bDate - aDate;
    });
  }

  return entries;
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addWatchTarget('content');

  eleventyConfig.addPassthroughCopy({ css: 'css' });
  eleventyConfig.addPassthroughCopy({ js: 'js' });
  eleventyConfig.addPassthroughCopy({ image: 'image' });
  eleventyConfig.addPassthroughCopy({ font: 'font' });

  eleventyConfig.addFilter('json', (value) => JSON.stringify(value, null, 2));
eleventyConfig.addFilter('withoutSlug', (items, slug) => (items || []).filter((item) => (item && item.slug) !== slug));

  eleventyConfig.on('eleventy.before', () => {
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
  });

  eleventyConfig.addCollection('properties', () => loadCollectionFromDir('properties'));
  eleventyConfig.addCollection('rentals', () => loadCollectionFromDir('rentals'));
  eleventyConfig.addCollection('blog', () => loadCollectionFromDir('blog'));

  return {
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    dir: {
      input: '.',
      includes: '_includes',
      data: 'content/_data',
      output: '_site',
    },
    templateFormats: ['html', 'njk', 'md', '11ty.js'],
  };
};
