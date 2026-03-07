const { normalizeRole } = require('../utils/roles');

/**
 * Middleware para garantir que operações sensíveis respeitem o tenant (município)
 * Este middleware deve ser usado APÓS o authMiddleware
 */
const tenantMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(500).json({ message: 'Erro de configuração: TenantMiddleware chamado sem autenticação prévia' });
  }

  const normalizedRole = normalizeRole(req.user.perfil);
  req.user.perfil = normalizedRole;

  if (normalizedRole !== 'ADMIN_ESTADO' && !req.user.codigo_ibge) {
    return res.status(403).json({ message: 'Acesso negado: Usuário sem vínculo municipal' });
  }

  req.tenantId = req.user.codigo_ibge;

  next();
};

module.exports = tenantMiddleware;
