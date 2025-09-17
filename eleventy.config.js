const cheerio = require('cheerio');
const { DateTime } = require('luxon');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ 'src/assets': 'assets' });

  eleventyConfig.addWatchTarget('./content/posts/');
  eleventyConfig.addWatchTarget('./content/properties/');

  eleventyConfig.addFilter('readableDate', (value) => {
    if (!value) {
      return '';
    }
    const dateValue = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(dateValue.getTime())) {
      return '';
    }
    return DateTime.fromJSDate(dateValue, { zone: 'utc' }).toLocaleString(DateTime.DATE_MED);
  });

  eleventyConfig.addTransform('cloudcannon-editable', (content, outputPath) => {
    if (!outputPath || !outputPath.endsWith('.html')) {
      return content;
    }

    const query = cheerio.load(content);
    query('h1,h2,h3,h4,h5,h6,p,span,img').each((_, element) => {
      const node = query(element);
      if (node.closest('[data-no-editable]').length) {
        return;
      }
      if (node.hasClass('editable')) {
        return;
      }
      if (node.is('span')) {
        const hasInteractiveChild = node.find('a,button,input,textarea,select').length > 0;
        if (hasInteractiveChild) {
          return;
        }
      }
      node.addClass('editable');
    });

    return query.html();
  });

  return {
    dir: {
      input: 'src',
      includes: '_includes',
      data: '_data',
      output: '_site'
    },
    templateFormats: ['njk', 'md'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk'
  };
};
