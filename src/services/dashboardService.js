const dashboardRepository = require('../repositories/dashboardRepository');

class DashboardService {
  async getDashboardData(codigoIbge) {
    const stats = await dashboardRepository.getStats(codigoIbge);
    const recentActivities = await dashboardRepository.getRecentActivities(codigoIbge);
    
    return {
      stats,
      recentActivities
    };
  }
}

module.exports = new DashboardService();
