# Vandore Heritage Eleventy Build

The site is now a JSON-driven Eleventy project. Templates live in `src/`, structured content lives under `content/`, and the Eleventy build in `_site/` is the only artifact deployed to CloudCannon.

## Build & Verification
- Requires Node 20 (match CloudCannon runtime).
- Install dependencies with `npm ci`.
- Build the static site: `npm run build` (outputs to `_site/`).
- Optional local preview: `npm run start` and browse the served URL, or open `_site/index.html` after a build.
- Fast regression check: `npm run build && npm run verify:properties`. The verification step asserts that each JSON property generates exactly one detail page.

## CloudCannon Settings
- **Build command:** `npm ci && npm run build`
- **Publish/output directory:** `_site`
- **Node version:** 20 (set in the CloudCannon UI)
- **Start/Run command:** leave unset (the Express prototype is no longer used)
- **Uploads:** `/image/uploads/` (already whitelisted)

CloudCannon previews point to the generated HTML (`/index.html`, `/properties/<slug>/`, etc.). No server routes such as `/sekcija/...` remain.

## Content Model
- `src/` – Eleventy templates (`.njk`) for pages, listings, and collection detail views.
- `content/pages/` – JSON companions for top-level pages.
- `content/properties/` – One JSON document per property. Eleventy paginates these into `/properties/<slug>/` detail pages and the `/properties/` listing.
- `content/rentals/` – Rental JSON (available for future automation).
- `content/blog/` – Blog post JSON powering `/blog/<slug>/`.
- `scripts/verify-properties.mjs` – Ensures JSON/property page parity.
- Assets remain in `/css`, `/js`, `/image`, and `/font`.

Each JSON record exposes fields such as `title`, `price`, `address`, `description`, `bedrooms`, `bathrooms`, optional `area`, `tags`, `gallery`, and `mapUrl`. Templates bind those fields via `data-sb-object-id`/`data-sb-field-path`, so CloudCannon’s visual editor edits the JSON directly.

## Adding or Editing Properties
1. Create `content/properties/<slug>.json` (slug drives the permalink). Use the existing keys; optional extras like `gallery` or `tags` enhance the layout.
2. Upload imagery into `/image/` (CloudCannon will keep uploads under `/image/uploads/`). Reference assets with paths such as `image/hero.jpg`.
3. Commit and push. CloudCannon rebuilds, the `/properties/` listing updates automatically, and the detail page renders at `/properties/<slug>/`.

The same JSON-first flow applies to blog posts (`content/blog/`). Rentals remain as static templates today; their JSON is stored for future migration.

## Backend Disabled
The legacy Express server and routes are unused. Do not add start commands or links to `/sekcija/...` endpoints; all navigation must stay on static Eleventy pages.
