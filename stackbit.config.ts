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
          urlPath: '/{slug}.html',
          fields: [
            { name: 'type', type: 'string', required: false },
            { name: 'title', type: 'string' },
            {
              name: 'seo',
              type: 'object',
              required: false,
              fields: [
                { name: 'description', type: 'text', required: false },
                {
                  name: 'og',
                  type: 'object',
                  required: false,
                  fields: [
                    { name: 'title', type: 'string', required: false },
                    { name: 'description', type: 'text', required: false }
                  ]
                },
                {
                  name: 'twitter',
                  type: 'object',
                  required: false,
                  fields: [
                    { name: 'title', type: 'string', required: false }
                  ]
                },
                {
                  name: 'favicon',
                  type: 'object',
                  required: false,
                  fields: [
                    { name: 'href', type: 'image', required: false }
                  ]
                }
              ]
            },
            {
              name: 'nav',
              type: 'object',
              required: false,
              fields: [
                {
                  name: 'logo',
                  type: 'object',
                  required: false,
                  fields: [
                    { name: 'src', type: 'image', required: false },
                    { name: 'alt', type: 'string', required: false },
                    { name: 'href', type: 'string', required: false }
                  ]
                },
                { name: 'menuTitle', type: 'string', required: false },
                {
                  name: 'toggle',
                  type: 'object',
                  required: false,
                  fields: [
                    { name: 'icon', type: 'string', required: false },
                    { name: 'label', type: 'string', required: false }
                  ]
                },
                {
                  name: 'links',
                  type: 'list',
                  required: false,
                  items: {
                    type: 'object',
                    fields: [
                      { name: 'label', type: 'string' },
                      { name: 'href', type: 'string', required: false },
                      {
                        name: 'image',
                        type: 'object',
                        required: false,
                        fields: [
                          { name: 'src', type: 'image', required: false },
                          { name: 'alt', type: 'string', required: false }
                        ]
                      }
                    ]
                  }
                }
              ]
            },
            { name: 'heroHeading', type: 'string', required: false },
            { name: 'heroSubheading', type: 'text', required: false },
            {
              name: 'hero',
              type: 'object',
              required: false,
              fields: [
                { name: 'eyebrow', type: 'string', required: false },
                { name: 'heading', type: 'string', required: false },
                { name: 'subheading', type: 'text', required: false },
                { name: 'body', type: 'markdown', required: false },
                {
                  name: 'buttons',
                  type: 'list',
                  required: false,
                  items: {
                    type: 'object',
                    fields: [
                      { name: 'label', type: 'string' },
                      { name: 'href', type: 'string', required: false },
                      { name: 'style', type: 'string', required: false }
                    ]
                  }
                },
                {
                  name: 'images',
                  type: 'list',
                  required: false,
                  items: {
                    type: 'object',
                    fields: [
                      { name: 'src', type: 'image', required: false },
                      { name: 'alt', type: 'string', required: false },
                      { name: 'caption', type: 'string', required: false },
                      { name: 'role', type: 'string', required: false }
                    ]
                  }
                }
              ]
            },
            {
              name: 'sections',
              type: 'list',
              required: false,
              items: {
                type: 'object',
                fields: [
                  { name: 'id', type: 'string', required: false },
                  { name: 'heading', type: 'string', required: false },
                  { name: 'subheading', type: 'string', required: false },
                  { name: 'body', type: 'markdown', required: false },
                  {
                    name: 'listItems',
                    type: 'list',
                    required: false,
                    items: { type: 'string' }
                  },
                  {
                    name: 'buttons',
                    type: 'list',
                    required: false,
                    items: {
                      type: 'object',
                      fields: [
                        { name: 'label', type: 'string' },
                        { name: 'href', type: 'string', required: false },
                        { name: 'style', type: 'string', required: false }
                      ]
                    }
                  },
                  {
                    name: 'images',
                    type: 'list',
                    required: false,
                    items: {
                      type: 'object',
                      fields: [
                        { name: 'src', type: 'image', required: false },
                        { name: 'alt', type: 'string', required: false },
                        { name: 'caption', type: 'string', required: false }
                      ]
                    }
                  },
                  {
                    name: 'items',
                    type: 'list',
                    required: false,
                    items: {
                      type: 'object',
                      fields: [
                        { name: 'title', type: 'string', required: false },
                        { name: 'subtitle', type: 'string', required: false },
                        { name: 'text', type: 'text', required: false },
                        { name: 'icon', type: 'string', required: false },
                        {
                          name: 'image',
                          type: 'object',
                          required: false,
                          fields: [
                            { name: 'src', type: 'image', required: false },
                            { name: 'alt', type: 'string', required: false }
                          ]
                        },
                        { name: 'badge', type: 'string', required: false },
                        {
                          name: 'button',
                          type: 'object',
                          required: false,
                          fields: [
                            { name: 'label', type: 'string' },
                            { name: 'href', type: 'string', required: false }
                          ]
                        },
                        {
                          name: 'link',
                          type: 'object',
                          required: false,
                          fields: [
                            { name: 'label', type: 'string', required: false },
                            { name: 'href', type: 'string', required: false }
                          ]
                        }
                      ]
                    }
                  }
                ]
              }
            },
            {
              name: 'properties',
              type: 'list',
              required: false,
              items: {
                type: 'object',
                fields: [
                  { name: 'title', type: 'string' },
                  { name: 'price', type: 'string', required: false },
                  { name: 'address', type: 'string', required: false },
                  { name: 'description', type: 'text', required: false },
                  { name: 'image', type: 'image', required: false },
                  {
                    name: 'badges',
                    type: 'list',
                    required: false,
                    items: { type: 'string' }
                  },
                  {
                    name: 'location',
                    type: 'object',
                    required: false,
                    fields: [
                      { name: 'icon', type: 'string', required: false },
                      { name: 'label', type: 'string', required: false }
                    ]
                  },
                  {
                    name: 'url',
                    type: 'object',
                    required: false,
                    fields: [
                      { name: 'href', type: 'string', required: false },
                      { name: 'label', type: 'string', required: false }
                    ]
                  }
                ]
              }
            },
            {
              name: 'team',
              type: 'list',
              required: false,
              items: {
                type: 'object',
                fields: [
                  { name: 'name', type: 'string' },
                  { name: 'role', type: 'string', required: false },
                  { name: 'bio', type: 'text', required: false },
                  { name: 'image', type: 'image', required: false }
                ]
              }
            },
            {
              name: 'faqs',
              type: 'list',
              required: false,
              items: {
                type: 'object',
                fields: [
                  { name: 'question', type: 'string' },
                  { name: 'answer', type: 'text' }
                ]
              }
            },
            {
              name: 'blogPosts',
              type: 'list',
              required: false,
              items: {
                type: 'object',
                fields: [
                  { name: 'title', type: 'string' },
                  { name: 'excerpt', type: 'text', required: false },
                  { name: 'date', type: 'string', required: false },
                  { name: 'url', type: 'string', required: false },
                  { name: 'image', type: 'image', required: false }
                ]
              }
            },
            {
              name: 'subscribe',
              type: 'object',
              required: false,
              fields: [
                { name: 'heading', type: 'string', required: false },
                { name: 'subheading', type: 'text', required: false },
                { name: 'placeholder', type: 'string', required: false },
                { name: 'buttonLabel', type: 'string', required: false },
                { name: 'icon', type: 'string', required: false },
                { name: 'invalidMessage', type: 'string', required: false }
              ]
            },
            {
              name: 'howItWorks',
              type: 'object',
              required: false,
              fields: [
                { name: 'heading', type: 'string', required: false },
                { name: 'background', type: 'image', required: false },
                {
                  name: 'steps',
                  type: 'list',
                  required: false,
                  items: {
                    type: 'object',
                    fields: [
                      { name: 'stepNumber', type: 'string', required: false },
                      { name: 'title', type: 'string', required: false },
                      { name: 'description', type: 'text', required: false },
                      { name: 'icon', type: 'string', required: false }
                    ]
                  }
                }
              ]
            },
            {
              name: 'backToTop',
              type: 'object',
              required: false,
              fields: [
                { name: 'href', type: 'string', required: false },
                { name: 'icon', type: 'string', required: false }
              ]
            },
            {
              name: 'footer',
              type: 'object',
              required: false,
              fields: [
                {
                  name: 'logo',
                  type: 'object',
                  required: false,
                  fields: [
                    { name: 'src', type: 'image', required: false },
                    { name: 'alt', type: 'string', required: false },
                    { name: 'href', type: 'string', required: false }
                  ]
                },
                {
                  name: 'contact',
                  type: 'object',
                  required: false,
                  fields: [
                    { name: 'heading', type: 'string', required: false },
                    { name: 'email', type: 'string', required: false },
                    { name: 'phone', type: 'string', required: false },
                    { name: 'address', type: 'string', required: false }
                  ]
                },
                {
                  name: 'columns',
                  type: 'list',
                  required: false,
                  items: {
                    type: 'object',
                    fields: [
                      { name: 'title', type: 'string', required: false },
                      {
                        name: 'links',
                        type: 'list',
                        required: false,
                        items: {
                          type: 'object',
                          fields: [
                            { name: 'label', type: 'string' },
                            { name: 'href', type: 'string', required: false }
                          ]
                        }
                      }
                    ]
                  }
                },
                {
                  name: 'legal',
                  type: 'list',
                  required: false,
                  items: {
                    type: 'object',
                    fields: [
                      { name: 'label', type: 'string' },
                      { name: 'href', type: 'string', required: false }
                    ]
                  }
                },
                {
                  name: 'social',
                  type: 'list',
                  required: false,
                  items: {
                    type: 'object',
                    fields: [
                      { name: 'icon', type: 'string', required: false },
                      { name: 'href', type: 'string', required: false }
                    ]
                  }
                }
              ]
            }
          ]
        },
        {
          name: 'Property',
          type: 'page',
          filePath: 'content/properties/{slug}.json',
          urlPath: '/properties/{slug}.html',
          fields: [
            { name: 'title', type: 'string' },
            { name: 'price', type: 'string' },
            { name: 'address', type: 'string' },
            { name: 'description', type: 'text' },
            { name: 'image', type: 'image', required: false },
            {
              name: 'gallery',
              type: 'list',
              required: false,
              items: {
                type: 'object',
                fields: [
                  { name: 'src', type: 'image', label: 'Image' },
                  { name: 'alt', type: 'string', required: false },
                  { name: 'caption', type: 'string', required: false }
                ]
              }
            },
            { name: 'url', type: 'string', required: false },
            { name: 'bedrooms', type: 'number', required: false },
            { name: 'bathrooms', type: 'number', required: false },
            { name: 'area', type: 'number', required: false },
            { name: 'floors', type: 'number', required: false }
          ]
        },
        {
          name: 'Rental',
          type: 'page',
          filePath: 'content/rentals/{slug}.json',
          urlPath: '/rentals/{slug}.html',
          fields: [
            { name: 'title', type: 'string' },
            { name: 'price', type: 'string' },
            { name: 'address', type: 'string' },
            { name: 'description', type: 'text' },
            { name: 'image', type: 'image', required: false },
            {
              name: 'gallery',
              type: 'list',
              required: false,
              items: {
                type: 'object',
                fields: [
                  { name: 'src', type: 'image', label: 'Image' },
                  { name: 'alt', type: 'string', required: false },
                  { name: 'caption', type: 'string', required: false }
                ]
              }
            },
            { name: 'url', type: 'string', required: false },
            { name: 'bedrooms', type: 'number', required: false },
            { name: 'bathrooms', type: 'number', required: false },
            { name: 'area', type: 'number', required: false },
            { name: 'floors', type: 'number', required: false }
          ]
        }
      ]
    })
  ],

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
