const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });
const filePath = path.join(dataDir, 'listings.json');

let state = { listings: [] };

function load() {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    state = JSON.parse(raw);
    if (!state || !Array.isArray(state.listings)) state = { listings: [] };
  } catch (e) {
    state = { listings: [] };
  }
}

function save() {
  const tmp = filePath + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, filePath);
}

load();

function getCountsByCategory() {
  const map = { pardosana: 0, ire: 0, istermina: 0 };
  for (const l of state.listings) {
    if (map[l.category] !== undefined) map[l.category] += 1;
  }
  return map;
}

function getListingsByCategory(category) {
  return state.listings
    .filter((l) => l.category === category)
    .sort((a, b) => b.created_at - a.created_at);
}

function getListingById(id) {
  return state.listings.find((l) => l.id === id) || null;
}

function createListing(listing) {
  state.listings.push(listing);
  save();
}

module.exports = {
  getCountsByCategory,
  getListingsByCategory,
  getListingById,
  createListing,
};
