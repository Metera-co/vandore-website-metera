# Vandore Heritage Static Site

The site is now a straight HTML project optimised for CloudCannon’s Visual Editor. Each page is editable in place and all “posts” (properties, rentals, and blog articles) live as folders with their own `index.html` so editors can duplicate and publish without touching code.

## Editing Pages
- Top level pages (`index.html`, `about.html`, `properties.html`, `rentals.html`, `service.html`, `contact.html`, `team.html`, etc.) sit in the repository root.
- Property pages live under `/properties/<slug>/index.html`.
- Rental pages live under `/rentals/<slug>/index.html`.
- Blog posts live under `/blog/<slug>/index.html`.
- To create a new entry, duplicate an existing folder, rename it to the new slug, and edit the content in CloudCannon.

## Assets
- Styles: `/css`
- Scripts: `/js`
- Images: `/image`
- Fonts: `/font`

Set CloudCannon’s upload directory to `/image/uploads/` so new media stays alongside the existing assets.

## Navigation
Headers and footers are repeated in every page. When you change navigation links or contact details, update each page (CloudCannon supports multi-file find/replace if you prefer).

## Local Preview
Open any of the HTML files directly in a browser or serve the repository with a simple static server (for example `npx http-server .`).
