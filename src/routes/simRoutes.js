const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');
const simController = require('../controllers/simController');

const router = express.Router();

router.use(authMiddleware, tenantMiddleware);

router.get('/', (req, res) => simController.obterTudo(req, res));
router.put('/info', (req, res) => simController.salvarInfo(req, res));
router.put('/feiras', (req, res) => simController.salvarFeiras(req, res));
router.put('/tipos-feiras/:tipo', (req, res) => simController.salvarTipoFeira(req, res));

module.exports = router;

