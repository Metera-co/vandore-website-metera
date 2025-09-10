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
          urlPath: '/{slug}',
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
          type: 'data',
          filePath: 'content/properties/{slug}.json',
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

  // Map JSON docs to real static HTML URLs
  siteMap: ({ documents }) => {
    const pages = documents
      .filter((d) => d.modelName === 'Page')
      .map((d) => {
        const slug = path.basename(String(d.filePath || '').replace(/\.json$/, ''));
        return {
          urlPath: `/${slug}.html`,
          pageSrc: `content/${slug}.njk`,
          pageObjectId: d.id
        } as SiteMapEntry;
      });

    const properties = documents
      .filter((d) => d.modelName === 'Property')
      .map((d) => {
        const slug = path.basename(String(d.filePath || '').replace(/\.json$/, ''));
        return {
          urlPath: `/properties/${slug}.html`,
          pageSrc: `content/property-detail.njk`,
          pageObjectId: d.id
        } as SiteMapEntry;
      });

    return [...pages, ...properties];
  }
});
