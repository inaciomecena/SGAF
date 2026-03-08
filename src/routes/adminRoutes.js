const express = require('express');
const router = express.Router();
const municipioController = require('../controllers/municipioController');
const userController = require('../controllers/userController');
const logController = require('../controllers/logController');
const authMiddleware = require('../middlewares/authMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');
const { normalizeRole } = require('../utils/roles');

const authorize = (...allowedRoles) => (req, res, next) => {
  const role = normalizeRole(req.user?.perfil);
  if (!allowedRoles.includes(role)) {
    return res.status(403).json({ message: 'Acesso negado para este perfil' });
  }
  next();
};

router.use(authMiddleware);

router.get('/municipios', authorize('ADMIN_ESTADO', 'GESTOR_MUNICIPAL'), municipioController.listar);
router.post('/municipios', authorize('ADMIN_ESTADO'), municipioController.criar);
router.get('/meus-dados', authorize('GESTOR_MUNICIPAL', 'ADMIN_ESTADO', 'TECNICO', 'OPERADOR'), municipioController.meusDados);
router.put('/meus-dados', authorize('GESTOR_MUNICIPAL', 'ADMIN_ESTADO', 'TECNICO', 'OPERADOR'), municipioController.salvarMeusDados);

router.get('/usuarios', tenantMiddleware, authorize('ADMIN_ESTADO', 'GESTOR_MUNICIPAL'), userController.listar);
router.post('/usuarios', tenantMiddleware, authorize('ADMIN_ESTADO', 'GESTOR_MUNICIPAL'), userController.criar);
router.get('/usuarios/:id', tenantMiddleware, authorize('ADMIN_ESTADO', 'GESTOR_MUNICIPAL'), userController.detalhar);
router.put('/usuarios/:id', tenantMiddleware, authorize('ADMIN_ESTADO', 'GESTOR_MUNICIPAL'), userController.atualizar);
router.delete('/usuarios/:id', tenantMiddleware, authorize('ADMIN_ESTADO', 'GESTOR_MUNICIPAL'), userController.desativar);
router.post('/usuarios/setup', authorize('ADMIN_ESTADO'), userController.criar);
router.get('/logs/acesso', tenantMiddleware, authorize('ADMIN_ESTADO', 'GESTOR_MUNICIPAL'), logController.listarAcessos);
router.get('/logs/sistema', tenantMiddleware, authorize('ADMIN_ESTADO', 'GESTOR_MUNICIPAL'), logController.listarSistema);

module.exports = router;
