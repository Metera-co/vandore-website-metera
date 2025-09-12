Pages annotated for inline editing

- pages/404.html: main scoped to `content/pages/404.json`
- pages/about.html: main scoped to `content/pages/about.json`
- pages/blog.html: main scoped to `content/pages/blog.json`
- pages/contact.html: main scoped to `content/pages/contact.json`
- pages/faq.html: main scoped to `content/pages/faq.json`
- pages/index.html: main scoped to `content/pages/index.json`
- pages/price_plan.html: main scoped to `content/pages/price_plan.json`
- pages/properties.html: main scoped to `content/pages/properties.json`
- pages/property-detail-template.html: main scoped to `content/properties/sample.json`
- pages/property_details.html: main scoped to `content/pages/property_details.json`
- pages/rentals.html: main scoped to `content/pages/rentals.json`
- pages/service.html: main scoped to `content/pages/service.json`
- pages/single_blog.html: main scoped to `content/pages/single_blog.json`
- pages/team.html: main scoped to `content/pages/team.json`

Notes

- Existing fields (already present in code): `title`, `heroHeading`, `heroSubheading`, `sections[...]`, `properties[...]` remain intact.
- SEO: added `seo.description`, `seo.og.*`, `seo.twitter.title`, `seo.favicon#@href` in pages/properties.html.
- Navigation: logo `nav.logo.href#@href`, `nav.logo.src#@src`, `nav.logo.alt`, toggle `nav.toggle.icon`, `nav.toggle.label`.
- Properties page: hero `hero.image#@src/alt`, grid `properties[i].image#@src/alt`, `title`, `price`, `address`, `description`, `badges[0..]`, `url#@href`, `url.label`, `location.icon`; how-it-works `howItWorks.bg.src`, `howItWorks.steps` with per-step `.icon` and `.stepNumber`; back-to-top `backToTop.href#@href`, `backToTop.icon`.
