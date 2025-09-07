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
            { name: 'heroSubheading', type: 'string' },
            {
              // generic sections for headings + text blocks
              name: 'sections',
              type: 'list',
              items: {
                type: 'object',
                fields: [
                  { name: 'heading', type: 'string' },
                  { name: 'text', type: 'text' }
                ]
              },
              required: false
            },
            {
              // property cards on listing pages
              name: 'properties',
              type: 'list',
              items: {
                type: 'object',
                fields: [
                  { name: 'title', type: 'string' },
                  { name: 'price', type: 'string' },
                  { name: 'address', type: 'string' },
                  { name: 'description', type: 'text', required: false },
                  { name: 'image', type: 'string', required: false },
                  { name: 'url', type: 'string', required: false }
                ]
              },
              required: false
            },
            {
              // team members
              name: 'team',
              type: 'list',
              items: {
                type: 'object',
                fields: [
                  { name: 'name', type: 'string' },
                  { name: 'role', type: 'string' },
                  { name: 'bio', type: 'text', required: false },
                  { name: 'image', type: 'string', required: false }
                ]
              },
              required: false
            },
            {
              // FAQs
              name: 'faqs',
              type: 'list',
              items: {
                type: 'object',
                fields: [
                  { name: 'question', type: 'string' },
                  { name: 'answer', type: 'text' }
                ]
              },
              required: false
            },
            {
              // blog cards/lists
              name: 'blogPosts',
              type: 'list',
              items: {
                type: 'object',
                fields: [
                  { name: 'title', type: 'string' },
                  { name: 'excerpt', type: 'text', required: false },
                  { name: 'date', type: 'string', required: false },
                  { name: 'url', type: 'string', required: false }
                ]
              },
              required: false
            }
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
