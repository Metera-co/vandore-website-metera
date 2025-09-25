const path = require('path');

module.exports = function (eleventyConfig) {
  eleventyConfig.addWatchTarget('content');

  eleventyConfig.addPassthroughCopy({ css: 'css' });
  eleventyConfig.addPassthroughCopy({ js: 'js' });
  eleventyConfig.addPassthroughCopy({ image: 'image' });
  eleventyConfig.addPassthroughCopy({ font: 'font' });

  eleventyConfig.addFilter('json', (value) => JSON.stringify(value, null, 2));

  eleventyConfig.on('eleventy.before', () => {
    const dataDir = path.join(__dirname, 'data');
    if (!require('fs').existsSync(dataDir)) {
      require('fs').mkdirSync(dataDir);
    }
  });

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