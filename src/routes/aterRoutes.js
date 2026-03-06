const express = require('express');
const router = express.Router();
const atendimentoController = require('../controllers/atendimentoController');
const authMiddleware = require('../middlewares/authMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');

router.use(authMiddleware, tenantMiddleware);

// Técnicos disponíveis
router.get('/tecnicos', atendimentoController.listarTecnicos);

// Atendimentos
router.post('/atendimentos', atendimentoController.registrar);
router.get('/atendimentos/:id', atendimentoController.detalhar);

// Histórico por Produtor
router.get('/produtores/:produtorId/historico', atendimentoController.historicoProdutor);

module.exports = router;
