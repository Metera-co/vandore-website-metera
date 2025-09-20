const path = require('path');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const dayjs = require('dayjs');
const { v4: uuidv4 } = require('uuid');

const db = require('./src/db');

const app = express();

const MAX_IMAGES = 12;
const MAX_FILE_SIZE_MB = 10;

app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const uploadsDir = path.join(__dirname, 'public', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/image', express.static(path.join(__dirname, 'image')));
app.use('/font', express.static(path.join(__dirname, 'font')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/uploads', express.static(uploadsDir));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const CATEGORIES = {
  pardosana: { key: 'pardosana', title: 'Pārdošana' },
  ire: { key: 'ire', title: 'Īre' },
  istermina: { key: 'istermina', title: 'Īstermiņa īres' },
};
app.locals.CATEGORIES = CATEGORIES;

function ensureCategory(req, res, next) {
  const { category } = req.params;
  if (!CATEGORIES[category]) {
    return res.status(404).render('404');
  }
  res.locals.category = CATEGORIES[category];
  next();
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    files: MAX_IMAGES,
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
  },
});

function mapUploadsToImages(files) {
  return (files || []).map((file) => ({
    id: uuidv4(),
    src: `/uploads/${file.filename}`,
    alt: '',
    caption: '',
  }));
}

function sanitizeText(value, maxLength = 5000) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function parseImageState(rawState, listing) {
  if (!rawState) {
    return listing.images || [];
  }

  let parsed;
  try {
    parsed = JSON.parse(rawState);
  } catch (error) {
    return listing.images || [];
  }

  if (!Array.isArray(parsed)) {
    return listing.images || [];
  }

  const knownImages = new Map((listing.images || []).map((image) => [image.id, image]));
  const result = [];

  for (const item of parsed) {
    if (!item || typeof item !== 'object') continue;
    const existing = knownImages.get(item.id);
    if (!existing) continue;

    result.push({
      id: existing.id,
      src: existing.src,
      alt: sanitizeText(item.alt || existing.alt || '', 180),
      caption: sanitizeText(item.caption || existing.caption || '', 280),
    });
  }

  return result;
}

function deleteRemovedImages(previous, next) {
  const nextIds = new Set((next || []).map((image) => image.id));
  for (const image of previous || []) {
    if (!nextIds.has(image.id) && typeof image.src === 'string' && image.src.startsWith('/uploads/')) {
      const filePath = path.join(uploadsDir, path.basename(image.src));
      fs.promises.unlink(filePath).catch(() => {});
    }
  }
}

app.get('/', (req, res) => {
  const counts = db.getCountsByCategory();
  const listings = db.getAllListings().slice(0, 6);
  res.render('index', { counts, listings, dayjs });
});

app.get('/sekcija/:category', ensureCategory, (req, res) => {
  const { category } = req.params;
  const listings = db.getListingsByCategory(category);
  res.render('category', { listings, current: res.locals.category, dayjs });
});

app.get('/sekcija/:category/pievienot', ensureCategory, (req, res) => {
  res.render('new', { current: res.locals.category, errors: [], old: {}, maxImages: MAX_IMAGES });
});

const listingValidators = [
  body('title').trim().notEmpty().withMessage('Nosaukums ir obligāts'),
  body('price').trim().optional({ checkFalsy: true }).isLength({ max: 64 }).withMessage('Cena nav derīga'),
  body('address').trim().optional({ checkFalsy: true }).isLength({ max: 200 }),
  body('city').trim().optional({ checkFalsy: true }).isLength({ max: 100 }),
  body('description').trim().optional({ checkFalsy: true }).isLength({ max: 5000 }),
  body('contact_name').trim().optional({ checkFalsy: true }).isLength({ max: 120 }),
  body('contact_phone').trim().optional({ checkFalsy: true }).isLength({ max: 64 }),
  body('contact_email').trim().optional({ checkFalsy: true }).isEmail().withMessage('E-pasts nav derīgs'),
];

app.post('/sekcija/:category/pievienot', ensureCategory, upload.array('images', MAX_IMAGES), listingValidators, (req, res) => {
  const { category } = req.params;
  const errors = validationResult(req);
  const old = req.body;

  if (!errors.isEmpty()) {
    return res.status(400).render('new', {
      current: res.locals.category,
      errors: errors.array(),
      old,
      maxImages: MAX_IMAGES,
    });
  }

  const uploadedImages = mapUploadsToImages(req.files);
  if (uploadedImages.length > MAX_IMAGES) {
    return res.status(400).render('new', {
      current: res.locals.category,
      errors: [{ msg: `Maksimālais attēlu skaits ir ${MAX_IMAGES}.` }],
      old,
    });
  }

  const id = uuidv4();
  db.createListing({
    id,
    category,
    title: req.body.title,
    price: req.body.price || '',
    address: req.body.address || '',
    city: req.body.city || '',
    description: req.body.description || '',
    contact_name: req.body.contact_name || '',
    contact_phone: req.body.contact_phone || '',
    contact_email: req.body.contact_email || '',
    images: uploadedImages,
  });

  res.redirect(`/sludinajums/${id}`);
});

app.get('/sludinajums/:id', (req, res) => {
  const listing = db.getListingById(req.params.id);
  if (!listing) {
    return res.status(404).render('404');
  }

  res.render('detail', { listing, dayjs });
});

app.get('/sludinajums/:id/rediget', (req, res) => {
  const listing = db.getListingById(req.params.id);
  if (!listing) {
    return res.status(404).render('404');
  }

  res.render('edit', {
    listing,
    errors: [],
    old: {
      title: listing.title,
      price: listing.price,
      address: listing.address,
      city: listing.city,
      description: listing.description,
      contact_name: listing.contact_name,
      contact_phone: listing.contact_phone,
      contact_email: listing.contact_email,
    },
    maxImages: MAX_IMAGES,
  });
});

app.post('/sludinajums/:id/rediget', upload.array('images', MAX_IMAGES), listingValidators, (req, res) => {
  const listing = db.getListingById(req.params.id);
  if (!listing) {
    return res.status(404).render('404');
  }

  const errors = validationResult(req);
  const old = req.body;

  if (!errors.isEmpty()) {
    return res.status(400).render('edit', {
    listing,
    errors: errors.array(),
    old,
    maxImages: MAX_IMAGES,
  });
  }

  const currentImages = parseImageState(req.body.imageState, listing);
  const uploadedImages = mapUploadsToImages(req.files);
  const totalImages = currentImages.length + uploadedImages.length;

  if (totalImages > MAX_IMAGES) {
    return res.status(400).render('edit', {
      listing,
      errors: [{ msg: `Maksimālais attēlu skaits ir ${MAX_IMAGES}.` }],
      old,
    });
  }

  deleteRemovedImages(listing.images, currentImages);

  const updated = db.updateListing(listing.id, {
    title: req.body.title,
    price: req.body.price || '',
    address: req.body.address || '',
    city: req.body.city || '',
    description: req.body.description || '',
    contact_name: req.body.contact_name || '',
    contact_phone: req.body.contact_phone || '',
    contact_email: req.body.contact_email || '',
    images: [...currentImages, ...uploadedImages],
  });

  res.redirect(`/sludinajums/${updated.id}`);
});

app.use((req, res) => {
  res.status(404).render('404');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveris darbojas: http://localhost:${PORT}`);
});








