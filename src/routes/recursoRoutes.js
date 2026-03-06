const express = require('express');
const router = express.Router();
const recursoController = require('../controllers/recursoController');
const authMiddleware = require('../middlewares/authMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');

router.use(authMiddleware, tenantMiddleware);

// --- MÁQUINAS ---
router.get('/maquinas', recursoController.listarMaquinas);
router.post('/maquinas', recursoController.criarMaquina);
router.get('/operadores', recursoController.listarOperadores);
router.post('/operadores', recursoController.criarOperador);
router.get('/agendamentos', recursoController.listarAgendamentos);
router.post('/agendamentos', recursoController.criarAgendamento);

// --- PROGRAMAS ---
router.get('/programas', recursoController.listarProgramas);
router.post('/programas', recursoController.criarPrograma);

// --- INSUMOS ---
router.get('/insumos', recursoController.listarInsumos);
router.post('/insumos', recursoController.criarInsumo);
router.post('/insumos/movimentacao', recursoController.movimentarEstoque); // Entrada ou Saída

// --- EVENTOS ---
router.get('/eventos', recursoController.listarEventos);
router.post('/eventos', recursoController.criarEvento);

module.exports = router;
