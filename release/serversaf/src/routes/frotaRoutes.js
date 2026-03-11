const express = require('express');
const router = express.Router();
const frotaController = require('../controllers/frotaController');
const authMiddleware = require('../middlewares/authMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');

// Rotas de Veículos
router.get('/veiculos', authMiddleware, tenantMiddleware, frotaController.listarVeiculos);
router.post('/veiculos', authMiddleware, tenantMiddleware, frotaController.criarVeiculo);
router.put('/veiculos/:id', authMiddleware, tenantMiddleware, frotaController.atualizarVeiculo);
router.delete('/veiculos/:id', authMiddleware, tenantMiddleware, frotaController.removerVeiculo);

// Rotas de Abastecimentos
router.get('/veiculos/:veiculoId/abastecimentos', authMiddleware, tenantMiddleware, frotaController.listarAbastecimentos);
router.post('/abastecimentos', authMiddleware, tenantMiddleware, frotaController.registrarAbastecimento);

module.exports = router;
