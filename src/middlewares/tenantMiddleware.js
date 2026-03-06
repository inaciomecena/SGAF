/**
 * Middleware para garantir que operações sensíveis respeitem o tenant (município)
 * Este middleware deve ser usado APÓS o authMiddleware
 */
const tenantMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(500).json({ message: 'Erro de configuração: TenantMiddleware chamado sem autenticação prévia' });
  }

  // O codigo_ibge vem do token JWT (req.user)
  // Se for um usuário ADMIN_ESTADO, talvez ele não tenha codigo_ibge fixo ou tenha acesso a todos.
  // Mas para GESTOR_MUNICIPAL, TECNICO, OPERADOR, o codigo_ibge é obrigatório.
  
  if (req.user.perfil !== 'ADMIN_ESTADO' && !req.user.codigo_ibge) {
    return res.status(403).json({ message: 'Acesso negado: Usuário sem vínculo municipal' });
  }

  // Injeta o codigo_ibge no request para facilitar acesso nos controllers/services
  req.tenantId = req.user.codigo_ibge;

  next();
};

module.exports = tenantMiddleware;
