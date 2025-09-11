# Nekustamo īpašumu vietne (LV)

Vienkārša vietne ar 3 sekcijām latviešu valodā:

- Pārdošana (`/sekcija/pardosana`)
- Īre (`/sekcija/ire`)
- Īstermiņa īres (`/sekcija/istermina`)

Var pievienot sludinājumus ar attēliem un apskatīt sarakstus katrā sekcijā.

## Palaišana lokāli

1. Instalējiet atkarības:
   - `npm install`
2. Startējiet serveri:
   - `npm start`
3. Atveriet pārlūkā: `http://localhost:3000`

Papildu skripti:
- `npm run dev` – attīstības režīms ar `nodemon`
- `npm run eleventy` – ja nepieciešams 11ty statisko lapu priekšskatījums (nav obligāti)

Augšupielādes saglabājas mapē `public/uploads`. Dati tiek glabāti kā JSON `data/listings.json`.

## Izvietošana Netlify

- Build komanda: `npm run build`
- Public direktorija: `_site`
- Node versija: `20` (norādīta `netlify.toml`)
- Visual Editor: iespējots ar `@netlify/plugin-visual-editor` (`netlify.toml`).

Soļi:
- Pievienojiet repozitoriju Netlify un izvēlieties galveno vai attiecīgo zaru.
- Pārliecinieties, ka build iestatījumi atbilst augstāk minētajiem.
- Pēc pirmā veiksmīgā build aktivizējiet Visual Editor Netlify vidē (Site settings → Visual Editor), ja pieejams jūsu plānā.
