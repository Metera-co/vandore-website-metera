import { defineStackbitConfig, SiteMapEntry } from '@stackbit/types';
import { GitContentSource } from '@stackbit/cms-git';
import * as path from 'path';

export default defineStackbitConfig({
  stackbitVersion: '~0.6.0',
  contentSources: [
    new GitContentSource({
      name: 'content',
      rootPath: __dirname,
      contentDirs: ['content'],
      models: [
        {
          name: 'Page',
          type: 'page',
          filePath: 'content/pages/{slug}.json',
          // Static pages under /pages map to /{slug}.html
          urlPath: '/{slug}.html',
          fields: [
            { name: 'title', type: 'string' },
            { name: 'heroHeading', type: 'string' },
            { name: 'heroSubheading', type: 'text' },
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
          // Treat each property JSON as its own page for the editor
          type: 'page',
          filePath: 'content/properties/{slug}.json',
          urlPath: '/properties/{slug}.html',
          fields: [
            { name: 'title', type: 'string' },
            { name: 'price', type: 'string' },
            { name: 'address', type: 'string' },
            { name: 'description', type: 'text' },
            { name: 'image', type: 'string' },
            { name: 'url', type: 'string' },
            { name: 'bedrooms', type: 'number', required: false },
            { name: 'bathrooms', type: 'number', required: false },
            { name: 'area', type: 'number', required: false },
            { name: 'floors', type: 'number', required: false }
          ]
        },
        {
          name: 'Rental',
          // Treat each rental JSON as its own page for the editor
          type: 'page',
          filePath: 'content/rentals/{slug}.json',
          urlPath: '/rentals/{slug}.html',
          fields: [
            { name: 'title', type: 'string' },
            { name: 'price', type: 'string' },
            { name: 'address', type: 'string' },
            { name: 'description', type: 'text' },
            { name: 'image', type: 'string' },
            { name: 'url', type: 'string' },
            { name: 'bedrooms', type: 'number', required: false },
            { name: 'bathrooms', type: 'number', required: false },
            { name: 'area', type: 'number', required: false },
            { name: 'floors', type: 'number', required: false }
          ]
        }
      ]
    })
  ],

  // Connect page models to live URLs in the Visual Editor
  siteMap: ({ documents, models }) => {
    const pageModelNames = models.filter((m) => m.type === 'page').map((m) => m.name);

    return documents
      .filter((d) => pageModelNames.includes(d.modelName))
      .map((document) => {
        const slug = path.basename(String(document.filePath || '').replace(/\.json$/, ''));
        const isHomePage = document.modelName === 'Page' && slug === 'index';

        let urlPath: string;
        switch (document.modelName) {
          case 'Property':
            urlPath = `/properties/${slug}.html`;
            break;
          case 'Rental':
            urlPath = `/rentals/${slug}.html`;
            break;
          default:
            urlPath = `/${slug}.html`;
        }

        return {
          stableId: document.id,
          urlPath,
          document,
          isHomePage
        } as SiteMapEntry;
      });
  }
});
