// stackbit.config.ts
import { defineStackbitConfig, SiteMapEntry } from "@stackbit/types";
import { GitContentSource } from "@stackbit/cms-git";

export default defineStackbitConfig({
  stackbitVersion: "~0.6.0",
  contentSources: [
    new GitContentSource({
      rootPath: __dirname,
      contentDirs: ["content"],
      models: [
        // One Page model per HTML page
        {
          name: "IndexPage",
          type: "page",
          filePath: "content/pages/{slug}.json",
          urlPath: slug === "index" ? "/" : `/${slug}.html`,
          fields: [
            { name: "title", type: "string" },
            { name: "heroHeading", type: "string" },
            { name: "heroSubheading", type: "text" }
          ]
        },
        {
          name: "AboutPage",
          type: "page",
          filePath: "content/pages/{slug}.json",
          urlPath: slug === "index" ? "/" : `/${slug}.html`,
          fields: [
            { name: "title", type: "string" },
            { name: "heroHeading", type: "string" },
            { name: "heroSubheading", type: "text" }
          ]
        },
        {
          name: "BlogPage",
          type: "page",
          filePath: "content/pages/{slug}.json",
          urlPath: slug === "index" ? "/" : `/${slug}.html`,
          fields: [
            { name: "title", type: "string" },
            { name: "heroHeading", type: "string" },
            { name: "heroSubheading", type: "text" }
          ]
        },
        {
          name: "ContactPage",
          type: "page",
          filePath: "content/pages/{slug}.json",
          urlPath: slug === "index" ? "/" : `/${slug}.html`,
          fields: [
            { name: "title", type: "string" },
            { name: "heroHeading", type: "string" },
            { name: "heroSubheading", type: "text" }
          ]
        },
        {
          name: "FaqPage",
          type: "page",
          filePath: "content/pages/{slug}.json",
          urlPath: slug === "index" ? "/" : `/${slug}.html`,
          fields: [
            { name: "title", type: "string" },
            { name: "heroHeading", type: "string" },
            { name: "heroSubheading", type: "text" }
          ]
        },
        {
          name: "PricePlanPage",
          type: "page",
          filePath: "content/pages/{slug}.json",
          urlPath: slug === "index" ? "/" : `/${slug}.html`,
          fields: [
            { name: "title", type: "string" },
            { name: "heroHeading", type: "string" },
            { name: "heroSubheading", type: "text" }
          ]
        },
        {
          name: "PropertiesPage",
          type: "page",
          filePath: "content/pages/{slug}.json",
          urlPath: slug === "index" ? "/" : `/${slug}.html`,
          fields: [
            { name: "title", type: "string" },
            { name: "heroHeading", type: "string" },
            { name: "heroSubheading", type: "text" }
          ]
        },
        {
          name: "PropertyDetailsPage",
          type: "page",
          filePath: "content/pages/{slug}.json",
          urlPath: slug === "index" ? "/" : `/${slug}.html`,
          fields: [
            { name: "title", type: "string" },
            { name: "heroHeading", type: "string" },
            { name: "heroSubheading", type: "text" }
          ]
        },
        {
          name: "PropertyDetailTemplatePage",
          type: "page",
          filePath: "content/pages/{slug}.json",
          urlPath: slug === "index" ? "/" : `/${slug}.html`,
          fields: [
            { name: "title", type: "string" },
            { name: "heroHeading", type: "string" },
            { name: "heroSubheading", type: "text" }
          ]
        },
        {
          name: "RentalsPage",
          type: "page",
          filePath: "content/pages/{slug}.json",
          urlPath: slug === "index" ? "/" : `/${slug}.html`,
          fields: [
            { name: "title", type: "string" },
            { name: "heroHeading", type: "string" },
            { name: "heroSubheading", type: "text" }
          ]
        },
        {
          name: "ServicePage",
          type: "page",
          filePath: "content/pages/{slug}.json",
          urlPath: slug === "index" ? "/" : `/${slug}.html`,
          fields: [
            { name: "title", type: "string" },
            { name: "heroHeading", type: "string" },
            { name: "heroSubheading", type: "text" }
          ]
        },
        {
          name: "SingleBlogPage",
          type: "page",
          filePath: "content/pages/{slug}.json",
          urlPath: slug === "index" ? "/" : `/${slug}.html`,
          fields: [
            { name: "title", type: "string" },
            { name: "heroHeading", type: "string" },
            { name: "heroSubheading", type: "text" }
          ]
        },
        {
          name: "TeamPage",
          type: "page",
          filePath: "content/pages/{slug}.json",
          urlPath: slug === "index" ? "/" : `/${slug}.html`,
          fields: [
            { name: "title", type: "string" },
            { name: "heroHeading", type: "string" },
            { name: "heroSubheading", type: "text" }
          ]
        },
        {
          name: "404Page",
          type: "page",
          filePath: "content/pages/{slug}.json",
          urlPath: slug === "index" ? "/" : `/${slug}.html`,
          fields: [
            { name: "title", type: "string" },
            { name: "heroHeading", type: "string" },
            { name: "heroSubheading", type: "text" }
          ]
        },
        // Optional Property data model
        {
          name: "Property",
          type: "data",
          filePath: "content/properties/{slug}.json",
          fields: [
            { name: "title", type: "string" },
            { name: "price", type: "string" },
            { name: "address", type: "string" },
            { name: "description", type: "text" },
            { name: "image", type: "string" },
            { name: "url", type: "string" }
          ]
        }
      ]
    })
  ],
  siteMap: ({ documents, models }) => {
    const pageModels = new Set(models.filter(m => m.type === "page").map(m => m.name));
    const entries: SiteMapEntry[] = [];
    for (const d of documents) {
      if (!pageModels.has(d.modelName)) continue;
      const slug = d.id;                           // filename without .json
      const url = slug === "index" ? "/" : `/${slug}.html`;
      entries.push({
        stableId: d.id,
        urlPath: url,
        document: d,
        isHomePage: slug === "index",
      });
    }
    return entries;
  }
});

