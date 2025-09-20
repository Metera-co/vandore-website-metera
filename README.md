# Nekustamo īpašumu vietne (LV)

Vienkārša vietne ar 3 sekcijām latviešu valodā:

- Pārdošana (/sekcija/pardosana)
- Īre (/sekcija/ire)
- Īstermiņa īres (/sekcija/istermina)

Var pievienot sludinājumus ar attēliem un apskatīt sarakstus katrā sekcijā.

## Palaišana lokāli

1. Instalējiet atkarības:
   - 
pm install
2. Startējiet serveri:
   - 
pm start
3. Atveriet pārlūkā: http://localhost:3000

Papildu skripti:
- 
pm run dev – attīstības režīms ar 
odemon
- 
pm run eleventy – ja nepieciešams 11ty statisko lapu priekšskatījums (nav obligāti)

Augšupielādes saglabājas mapē public/uploads. Dati tiek glabāti kā JSON data/listings.json.

## Izvietošana Netlify

- Build komanda: 
pm run build
- Public direktorija: _site
- Node versija: 20 (norādīta 
etlify.toml)
- Visual Editor: iespējots ar @netlify/plugin-visual-editor (
etlify.toml).

Soļi:
- Pievienojiet repozitoriju Netlify un izvēlieties galveno vai attiecīgo zaru.
- Pārliecinieties, ka build iestatījumi atbilst augstāk minētajiem.
- Pēc pirmā veiksmīgā build aktivizējiet Visual Editor Netlify vidē (Site settings → Visual Editor), ja pieejams jūsu plānā.