const express = require('express');
const router = express.Router();
const municipioController = require('../controllers/municipioController');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');

// Rotas de Municípios (Públicas ou Protegidas? Idealmente protegidas por ADMIN_ESTADO, mas vamos deixar criar público por enquanto para setup inicial)
router.get('/municipios', municipioController.listar);
router.post('/municipios', municipioController.criar);

// Rotas de Usuários
// Criar primeiro usuário admin (Rota aberta para setup inicial - CUIDADO EM PRODUÇÃO)
router.post('/usuarios/setup', userController.criar);

// Rotas protegidas de usuários
router.use('/usuarios', authMiddleware, tenantMiddleware);
router.get('/usuarios', userController.listar);
router.post('/usuarios', userController.criar);

module.exports = router;
