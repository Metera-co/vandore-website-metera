const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'listings.json');
const DEFAULT_DATA = { listings: [] };

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return { ...DEFAULT_DATA };
    }

    const raw = fs.readFileSync(DB_FILE, 'utf8');
    if (!raw.trim()) {
      return { ...DEFAULT_DATA };
    }

    const parsed = JSON.parse(raw);
    const listings = Array.isArray(parsed.listings) ? parsed.listings.map(normalizeListing) : [];
    return { listings };
  } catch (error) {
    console.error('Failed to read listings database:', error);
    return { ...DEFAULT_DATA };
  }
}

function writeDb(data) {
  try {
    ensureDataDir();
    const safeData = {
      listings: Array.isArray(data.listings) ? data.listings.map(normalizeListing) : [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(safeData, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to write listings database:', error);
    throw error;
  }
}

function normalizeListing(listing) {
  if (!listing || typeof listing !== 'object') {
    return null;
  }

  const images = Array.isArray(listing.images)
    ? listing.images.map(normalizeImage).filter(Boolean)
    : [];

  const createdAt = Number.isFinite(listing.created_at) ? listing.created_at : Date.now();
  const updatedAt = Number.isFinite(listing.updated_at) ? listing.updated_at : createdAt;

  return {
    id: listing.id || randomUUID(),
    category: listing.category || 'pardosana',
    title: listing.title || '',
    price: listing.price || '',
    address: listing.address || '',
    city: listing.city || '',
    description: listing.description || '',
    contact_name: listing.contact_name || '',
    contact_phone: listing.contact_phone || '',
    contact_email: listing.contact_email || '',
    images,
    created_at: createdAt,
    updated_at: updatedAt,
  };
}

function normalizeImage(image) {
  if (!image) return null;

  if (typeof image === 'string') {
    return {
      id: randomUUID(),
      src: image,
      alt: '',
      caption: '',
    };
  }

  if (typeof image === 'object') {
    const src = image.src || image.url || '';
    if (!src) return null;

    return {
      id: image.id || randomUUID(),
      src,
      alt: image.alt || '',
      caption: image.caption || '',
    };
  }

  return null;
}

function getAllListings() {
  return readDb().listings;
}

function getListingById(id) {
  return getAllListings().find((listing) => listing.id === id) || null;
}

function getListingsByCategory(category) {
  return getAllListings().filter((listing) => listing.category === category);
}

function getCountsByCategory() {
  const counts = { pardosana: 0, ire: 0, istermina: 0 };
  for (const listing of getAllListings()) {
    if (counts.hasOwnProperty(listing.category)) {
      counts[listing.category] += 1;
    }
  }
  return counts;
}

function createListing(listing) {
  const data = readDb();
  const normalized = normalizeListing({ ...listing, created_at: Date.now(), updated_at: Date.now() });
  data.listings.unshift(normalized);
  writeDb(data);
  return normalized;
}

function updateListing(id, updates) {
  const data = readDb();
  const index = data.listings.findIndex((listing) => listing.id === id);
  if (index === -1) {
    return null;
  }

  const existing = data.listings[index];
  const merged = normalizeListing({
    ...existing,
    ...updates,
    id: existing.id,
    created_at: existing.created_at,
    updated_at: Date.now(),
  });

  data.listings[index] = merged;
  writeDb(data);
  return merged;
}

function removeListing(id) {
  const data = readDb();
  const nextListings = data.listings.filter((listing) => listing.id !== id);
  const removed = nextListings.length !== data.listings.length;
  if (removed) {
    writeDb({ listings: nextListings });
  }
  return removed;
}

module.exports = {
  getAllListings,
  getListingById,
  getListingsByCategory,
  getCountsByCategory,
  createListing,
  updateListing,
  removeListing,
  writeDb,
  readDb,
};