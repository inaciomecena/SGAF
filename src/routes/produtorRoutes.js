const express = require('express');
const router = express.Router();
const produtorController = require('../controllers/produtorController');
const authMiddleware = require('../middlewares/authMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');

// Middleware global para rotas de produtores
router.use(authMiddleware, tenantMiddleware);

// Produtores
router.get('/produtores', produtorController.listar);
router.post('/produtores', produtorController.criar);
router.get('/produtores/:id', produtorController.detalhar);

// Propriedades (Sub-recurso de produtor)
router.post('/produtores/:produtorId/propriedades', produtorController.criarPropriedade);
router.get('/propriedades', produtorController.listarPropriedades);

module.exports = router;
