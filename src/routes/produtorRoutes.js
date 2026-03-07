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
router.get('/produtores/:produtorId/propriedades', produtorController.listarPropriedadesPorProdutor);
router.get('/propriedades', produtorController.listarPropriedades);
router.get('/propriedades/:id', produtorController.detalharPropriedade);
router.put('/propriedades/:id', produtorController.atualizarPropriedade);
router.delete('/propriedades/:id', produtorController.excluirPropriedade);
router.get('/culturas', produtorController.listarCulturasDisponiveis);
router.get('/propriedades/:id/culturas', produtorController.listarCulturasPropriedade);
router.post('/propriedades/:id/culturas', produtorController.adicionarCulturaPropriedade);
router.put('/propriedades/:id/culturas/:culturaRegistroId', produtorController.atualizarCulturaPropriedade);
router.delete('/propriedades/:id/culturas/:culturaRegistroId', produtorController.excluirCulturaPropriedade);

module.exports = router;
