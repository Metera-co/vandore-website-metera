const { defineStackbitConfig } = require('@stackbit/types');
const { GitContentSource } = require('@stackbit/cms-git');

module.exports = defineStackbitConfig({
  stackbitVersion: '~0.6.0',
  contentSources: [
    new GitContentSource({
      rootPath: __dirname,
      contentDirs: ['content'],
      models: [
        {
          name: 'Page',
          type: 'page',
          filePath: 'content/pages/{slug}.json',
          fields: [
            { name: 'title', type: 'string' },
            { name: 'heroHeading', type: 'string' },
            { name: 'heroSubheading', type: 'string' }
          ]
        },
        {
          name: 'Property',
          type: 'data',
          filePath: 'content/properties/{slug}.json',
          fields: [
            { name: 'title', type: 'string' },
            { name: 'price', type: 'string' },
            { name: 'address', type: 'string' },
            { name: 'description', type: 'text' },
            { name: 'image', type: 'string', required: false },
            { name: 'url', type: 'string', required: false }
          ]
        }
      ]
    })
  ],
  siteMap: ({ documents }) =>
    documents
      .filter(d => d.modelName === 'Page')
      .map(d => {
        const slug = d.id;
        return {
          stableId: d.id,
          urlPath: slug === 'index' ? '/' : `/${slug}.html`,
          document: d,
          isHomePage: slug === 'index'
        };
      })
});

