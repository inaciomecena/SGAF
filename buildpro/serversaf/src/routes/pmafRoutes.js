const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const authMiddleware = require('../middlewares/authMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');
const pmafController = require('../controllers/pmafController');

const router = express.Router();

const uploadDir = path.resolve(__dirname, '../../uploads/pmaf');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const extension = path.extname(file.originalname || '').toLowerCase() || '.pdf';
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
    }
  }),
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/webp'
    ];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Arquivo inválido. Envie PDF ou imagem (PNG/JPG/WEBP).'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 12 * 1024 * 1024
  }
});

router.use(authMiddleware, tenantMiddleware);

router.get('/', (req, res) => pmafController.listar(req, res));
router.get('/info', (req, res) => pmafController.obterInfo(req, res));
router.put('/info', upload.single('documento'), (req, res) => pmafController.salvarInfo(req, res));
router.delete('/info', (req, res) => pmafController.removerInfo(req, res));

module.exports = router;

