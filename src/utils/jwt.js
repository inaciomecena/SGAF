const jwt = require('jsonwebtoken');

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
    process.env.JWT_SECRET,
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
  return jwt.verify(token, process.env.JWT_SECRET);
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
