import { defineStackbitConfig } from '@stackbit/types';
import { GitContentSource } from '@stackbit/cms-git';

export default defineStackbitConfig({
  stackbitVersion: '~0.6.0',
  contentSources: [
    new GitContentSource({
      name: 'content',
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
            { name: 'address', type: 'string' },
            { name: 'description', type: 'text' },
            { name: 'image', type: 'string' },
            { name: 'url', type: 'string' }
          ]
        }
      ]
    })
  ]
});
