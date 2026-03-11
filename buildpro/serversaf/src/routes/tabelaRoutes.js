const express = require('express');
const router = express.Router();
const culturaSafController = require('../controllers/culturaSafController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/culturas', culturaSafController.listar);
router.post('/culturas', culturaSafController.criar);
router.get('/culturas/:id', culturaSafController.detalhar);
router.put('/culturas/:id', culturaSafController.atualizar);

module.exports = router;
