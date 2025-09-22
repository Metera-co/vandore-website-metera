# Vandore Heritage Static Site

This repository holds the marketing site for Vandore Heritage. HTML pages live at the project root so CloudCannon can edit them directly with data pulled from the JSON in `content/` and `data/`.

## Local Preview

Any static server will work. A couple of quick options:

```bash
npx serve . -p 8080
# or
python -m http.server 8080
```

Then open `http://localhost:8080/` to browse the site (every other page sits beside `index.html`).

## CloudCannon Setup

- `.cloudcannon/config.yml` already references the root-level HTML files and collections.
- Build/install commands are blank so CloudCannon serves the repository as-is.
- Uploads stay in `image/uploads/`, which the config preserves between builds.

### Editing Pages
- Open any page in the Visual Editor; changes sync to the JSON under `content/pages/`.
- Structured page data is exposed through the **Page Content** collection.

### Managing Listings and Blog Posts
- **Properties** → `content/properties/*.json` for individual detail pages and `data/properties.json` for the listing grid.
- **Rentals** → `data/rentals.json` (two hero images per entry).
- **Blog** → `data/blogs.json` (standard fields + body sections).

### Repository Structure
- `*.html` — root-level pages used by CloudCannon’s Visual Editor.
- `content/` — page-specific JSON mirrored by `data-sb-field-path` bindings.
- `data/` — collection JSON powering the rentals, properties, and blog listings.
- `css/`, `js/`, `image/`, `font/` — assets referenced with root-relative paths.
- `.cloudcannon/` — CloudCannon project configuration and schemas.

