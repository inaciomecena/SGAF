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

export const normalizeRole = (role) => {
  if (!role || typeof role !== 'string') return role;
  const normalized = role
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  return ROLE_ALIASES[normalized] || normalized;
};

export const isAdminEstado = (role) => normalizeRole(role) === 'ADMIN_ESTADO';

export const canManageUsers = (role) => {
  const normalized = normalizeRole(role);
  return normalized === 'ADMIN_ESTADO' || normalized === 'GESTOR_MUNICIPAL';
};

export const canAccessPmaf = (role) => {
  const normalized = normalizeRole(role);
  return normalized === 'ADMIN_ESTADO' || normalized === 'TECNICO';
};

export const canAccessSim = (role) => {
  const normalized = normalizeRole(role);
  return normalized === 'TECNICO' || normalized === 'GESTOR_MUNICIPAL';
};

export const roleLabel = (role) => {
  const normalized = normalizeRole(role);

  if (normalized === 'ADMIN_ESTADO') return 'Admin Estadual';
  if (normalized === 'GESTOR_MUNICIPAL') return 'Gestor Municipal';
  if (normalized === 'TECNICO') return 'Técnico';
  if (normalized === 'OPERADOR') return 'Operador';

  return normalized;
};
