const dashboardService = require('../services/dashboardService');

class DashboardController {
  async getDashboardData(req, res) {
    try {
      const data = await dashboardService.getDashboardData(req.tenantId);
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao carregar dados do dashboard' });
    }
  }
}

module.exports = new DashboardController();
