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

  // Note: The project currently stores static pages under `pages/`.
  // We configure Eleventy to use that as the input so Netlify builds `_site` correctly.

  return {
    dir: {
      input: 'pages',
      output: '_site',
      includes: '_includes',
      data: '_data'
    },
    // Limit to HTML so it doesn't attempt to process other files at repo root
    templateFormats: ['html']
  };
};

