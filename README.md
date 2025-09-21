# Vandore Heritage Static Site

This repository contains the marketing website for Vandore Heritage. The site is a static HTML template organised for CloudCannon so every page can be edited visually and structured content (properties, rentals, blog posts) can be managed from collection editors.

## Local Preview

1. Install the tooling once (installs the HTML-to-JSON helper only):
   ```bash
   npm install
   ```
2. Run any static file server from the project root (examples below) and open `http://localhost:8080/pages/index.html`:
   ```bash
   npx http-server -p 8080 .
   # or
   python -m http.server 8080
   ```

When you change the HTML templates in `pages/`, regenerate the structured content JSON by running:
```bash
npm run generate:content
```
This keeps the files in `content/pages/` in sync with the inline editing bindings used by CloudCannon.

## CloudCannon Setup

1. Connect the repository/branch to CloudCannon.
2. In **Settings -> Build**, set:
   - Install command: `npm install`
   - Build command: `npm run build` (prints a status message only)
   - Output path: `.` (the pages are already static inside the repo)
3. Under **Files**, the Visual Editor will serve the HTML from `pages/`. Every page is linked to a JSON data file in `content/pages/` through `data-sb-field-path` bindings, so text and images can be edited inline.
4. Image uploads from the editor go to `image/uploads/` (preserved via `.cloudcannon/config.yml`).

### Editing Pages
- Open a page in the Visual Editor and change copy or images directly. Saving updates the matching JSON file inside `content/pages/`.
- For bulk updates, edit the JSON files inside the `Page Content` collection (CloudCannon automatically exposes the folder defined in `.cloudcannon/config.yml`).

### Managing Listings and Blog Posts
CloudCannon collections power the structured content:
- **Properties** (`data/properties.json` -> key `properties`)
- **Rentals** (`data/rentals.json` -> key `rentals`)
- **Blogs** (`data/blogs.json` -> key `blogs`)

Each collection has a schema describing the fields (slug, title, price, address, gallery, etc.). Adding or editing entries through CloudCannon updates the corresponding JSON file, which the front-end JavaScript reads to render listings.

### Adding New Assets
- Upload images through CloudCannon to `image/uploads/` to keep paths consistent.
- When referencing uploads in JSON or page data, use `/image/uploads/filename.ext` so the static pages resolve correctly both locally and on CloudCannon.

## Helpful Scripts
- `npm run generate:content` – re-generates `content/pages/*.json` and `content/properties/*.json` from the HTML templates.
- `npm run build` – placeholder build that satisfies CloudCannon (prints a confirmation message).

## Repository Structure
- `pages/` – HTML pages consumed directly by CloudCannon as the static site.
- `content/` – JSON data backing the inline editor bindings.
- `data/` – JSON collections consumed by front-end scripts for listings.
- `js/` – Front-end JavaScript (filters, data loading, etc.).
- `.cloudcannon/config.yml` – CloudCannon project configuration and collection schemas.

