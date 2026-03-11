const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');
const authMiddleware = require('../middlewares/authMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');

router.use(authMiddleware, tenantMiddleware);

router.post('/push', syncController.push);
router.get('/pull', syncController.pull);

module.exports = router;
