const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');

router.use(authMiddleware, tenantMiddleware);

router.get('/', dashboardController.getDashboardData);

module.exports = router;
