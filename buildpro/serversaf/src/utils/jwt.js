const jwt = require('jsonwebtoken');

const getAccessSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (typeof secret !== 'string' || secret.trim().length === 0) {
    throw new Error('JWT_SECRET não configurado. Defina JWT_SECRET no arquivo .env do servidor (ou variável de ambiente).');
  }
  return secret;
};

const getRefreshSecret = () => process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
const getResetSecret = () => process.env.JWT_RESET_SECRET || process.env.JWT_SECRET;

const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      codigo_ibge: user.codigo_ibge, 
      perfil: user.perfil,
      email: user.email 
    },
    getAccessSecret(),
    { expiresIn: '8h' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id
    },
    getRefreshSecret(),
    { expiresIn: '7d' }
  );
};

const generatePasswordResetToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email
    },
    getResetSecret(),
    { expiresIn: '15m' }
  );
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, getAccessSecret());
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, getRefreshSecret());
};

const verifyPasswordResetToken = (token) => {
  return jwt.verify(token, getResetSecret());
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generatePasswordResetToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyPasswordResetToken
};
