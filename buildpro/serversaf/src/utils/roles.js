const ROLE_ALIASES = {
  ADMIN_ESTADO: 'ADMIN_ESTADO',
  ADMIN: 'ADMIN_ESTADO',
  ADMINISTRADOR: 'ADMIN_ESTADO',
  ADM_ESTADO: 'ADMIN_ESTADO',
  ADMIN_ESTADUAL: 'ADMIN_ESTADO',
  GESTOR_MUNICIPAL: 'GESTOR_MUNICIPAL',
  GESTOR: 'GESTOR_MUNICIPAL',
  MUNICIPIO: 'GESTOR_MUNICIPAL',
  MUNICIPAL: 'GESTOR_MUNICIPAL',
  SECRETARIA_MUNICIPAL: 'GESTOR_MUNICIPAL',
  GESTOR_DE_MUNICIPIO: 'GESTOR_MUNICIPAL',
  ADMIN_MUNICIPAL: 'GESTOR_MUNICIPAL',
  ADMINISTRADOR_MUNICIPAL: 'GESTOR_MUNICIPAL',
  SECRETARIO: 'GESTOR_MUNICIPAL',
  SECRETARIA: 'GESTOR_MUNICIPAL',
  SECRETARIO_MUNICIPAL: 'GESTOR_MUNICIPAL',
  TECNICO: 'TECNICO',
  TECNICO_CAMPO: 'TECNICO',
  OPERADOR: 'OPERADOR',
  OPERADOR_MAQUINA: 'OPERADOR'
};

const normalizeRole = (role) => {
  if (!role || typeof role !== 'string') {
    return role;
  }

  const normalized = role
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  return ROLE_ALIASES[normalized] || normalized;
};

const canManageUsers = (role) => {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === 'ADMIN_ESTADO' || normalizedRole === 'GESTOR_MUNICIPAL';
};

const isAdminEstado = (role) => normalizeRole(role) === 'ADMIN_ESTADO';

const canAccessPmaf = (role) => {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === 'ADMIN_ESTADO' || normalizedRole === 'TECNICO';
};

const canAccessSim = (role) => {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === 'TECNICO' || normalizedRole === 'GESTOR_MUNICIPAL';
};

const allowedProfilesToCreate = (role) => {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === 'ADMIN_ESTADO') {
    return ['ADMIN_ESTADO', 'GESTOR_MUNICIPAL', 'TECNICO', 'OPERADOR'];
  }

  if (normalizedRole === 'GESTOR_MUNICIPAL') {
    return ['GESTOR_MUNICIPAL', 'TECNICO', 'OPERADOR'];
  }

  return [];
};

module.exports = {
  normalizeRole,
  canManageUsers,
  isAdminEstado,
  canAccessPmaf,
  canAccessSim,
  allowedProfilesToCreate
};
