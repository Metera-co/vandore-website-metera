import { defineStackbitConfig } from '@stackbit/types';

export default defineStackbitConfig({
  stackbitVersion: '~0.6.0',
  contentSources: [
    {
      name: 'content',
      type: 'git',
      rootPath: '.',
      contentDirs: ['content'],
      models: [
        {
          name: 'Page',
          type: 'page',
          filePath: 'content/pages/{slug}.json',
          urlPath: '/{slug}',
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
            { name: 'location', type: 'string' },
            { name: 'description', type: 'text' }
          ]
        }
      ]
    }
  ]
});

