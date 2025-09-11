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

// Basic hardening and middleware
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Ensure directories exist
const uploadsDir = path.join(__dirname, 'public', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

// Static assets (reuse existing folders)
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/image', express.static(path.join(__dirname, 'image')));
app.use('/font', express.static(path.join(__dirname, 'font')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/uploads', express.static(uploadsDir));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Categories map
const CATEGORIES = {
  pardosana: { key: 'pardosana', title: 'Pārdošana' },
  ire: { key: 'ire', title: 'Īre' },
  istermina: { key: 'istermina', title: 'Īstermiņa īres' },
};

function ensureCategory(req, res, next) {
  const { category } = req.params;
  if (!CATEGORIES[category]) return res.status(404).render('404', { CATEGORIES });
  res.locals.category = CATEGORIES[category];
  next();
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});
const upload = multer({ storage, limits: { files: 8, fileSize: 10 * 1024 * 1024 } });

// Home
app.get('/', (req, res) => {
  const counts = db.getCountsByCategory();
  res.render('index', { CATEGORIES, counts });
});

// Category listing
app.get('/sekcija/:category', ensureCategory, (req, res) => {
  const { category } = req.params;
  const listings = db.getListingsByCategory(category);
  res.render('category', { CATEGORIES, listings, current: CATEGORIES[category] });
});

// New listing form
app.get('/sekcija/:category/pievienot', ensureCategory, (req, res) => {
  res.render('new', { CATEGORIES, current: res.locals.category, errors: [], old: {} });
});

// Create listing
app.post(
  '/sekcija/:category/pievienot',
  ensureCategory,
  upload.array('images', 8),
  [
    body('title').trim().notEmpty().withMessage('Nosaukums ir obligāts'),
    body('price').trim().optional({ checkFalsy: true }).isLength({ max: 64 }).withMessage('Cena nav derīga'),
    body('address').trim().optional({ checkFalsy: true }).isLength({ max: 200 }),
    body('city').trim().optional({ checkFalsy: true }).isLength({ max: 100 }),
    body('description').trim().optional({ checkFalsy: true }).isLength({ max: 5000 }),
    body('contact_name').trim().optional({ checkFalsy: true }).isLength({ max: 120 }),
    body('contact_phone').trim().optional({ checkFalsy: true }).isLength({ max: 64 }),
    body('contact_email').trim().optional({ checkFalsy: true }).isEmail().withMessage('E-pasts nav derīgs'),
  ],
  (req, res) => {
    const { category } = req.params;
    const errors = validationResult(req);
    const old = req.body;
    if (!errors.isEmpty()) {
      return res.status(400).render('new', {
        CATEGORIES,
        current: CATEGORIES[category],
        errors: errors.array(),
        old,
      });
    }

    const id = uuidv4();
    const imagePaths = (req.files || []).map((f) => `/uploads/${path.basename(f.path)}`);
    const now = Date.now();

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
      images: imagePaths,
      created_at: now,
    });

    res.redirect(`/sludinajums/${id}`);
  }
);

// Listing detail
app.get('/sludinajums/:id', (req, res) => {
  const listing = db.getListingById(req.params.id);
  if (!listing) return res.status(404).render('404', { CATEGORIES });
  res.render('detail', { CATEGORIES, listing, dayjs });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).render('404', { CATEGORIES });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveris darbojas: http://localhost:${PORT}`);
});

