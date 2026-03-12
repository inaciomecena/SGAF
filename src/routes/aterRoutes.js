const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const atendimentoController = require('../controllers/atendimentoController');
const authMiddleware = require('../middlewares/authMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');

const uploadDir = path.resolve(__dirname, '../../uploads/atendimentos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const extension = path.extname(file.originalname || '').toLowerCase() || '.jpg';
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
    }
  }),
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Apenas imagens são permitidas'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 8 * 1024 * 1024
  }
});

router.use(authMiddleware, tenantMiddleware);

// Técnicos disponíveis
router.get('/tecnicos', atendimentoController.listarTecnicos);

// Atendimentos
router.get('/atendimentos', atendimentoController.listar);
router.post('/atendimentos', atendimentoController.registrar);
router.get('/atendimentos/:id', atendimentoController.detalhar);
router.put('/atendimentos/:id/transporte', atendimentoController.atualizarTransporte);
router.post('/atendimentos/:id/fotos', upload.array('fotos', 8), atendimentoController.anexarFotos);
router.delete('/atendimentos/fotos/:id', atendimentoController.removerFoto);

// Histórico por Produtor
router.get('/produtores/:produtorId/historico', atendimentoController.historicoProdutor);

module.exports = router;
