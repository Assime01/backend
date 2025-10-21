const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crée le dossier uploads s'il n'existe pas
const uploads = 'uploads';
if (!fs.existsSync(uploads)) {
  fs.mkdirSync(uploads);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploads);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5 Mo
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
      return cb(new Error('Seules les images JPG/PNG sont autorisées'));
    }
    cb(null, true);
  }
});

module.exports = upload; // export direct
