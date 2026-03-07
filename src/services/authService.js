const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');
const {
  generateAccessToken,
  generateRefreshToken,
  generatePasswordResetToken,
  verifyRefreshToken,
  verifyPasswordResetToken
} = require('../utils/jwt');
const { normalizeRole } = require('../utils/roles');

class AuthService {
  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    
    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    const isMatch = await bcrypt.compare(password, user.senha_hash);
    
    if (!isMatch) {
      throw new Error('Credenciais inválidas');
    }

    const normalizedUser = {
      ...user,
      perfil: normalizeRole(user.perfil)
    };

    const token = generateAccessToken(normalizedUser);
    const refreshToken = generateRefreshToken(normalizedUser);
    await userRepository.updateLastLogin(user.id);

    return {
      token,
      refreshToken,
      user: {
        id: normalizedUser.id,
        nome: normalizedUser.nome,
        email: normalizedUser.email,
        perfil: normalizedUser.perfil,
        codigo_ibge: normalizedUser.codigo_ibge
      }
    };
  }

  async refresh(refreshToken) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new Error('Refresh token inválido');
    }

    const user = await userRepository.findById(payload.id);
    if (!user || !user.ativo) {
      throw new Error('Usuário inválido');
    }

    const normalizedUser = {
      ...user,
      perfil: normalizeRole(user.perfil)
    };

    return {
      token: generateAccessToken(normalizedUser)
    };
  }

  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return { message: 'Se o email existir, você receberá instruções para redefinir sua senha' };
    }

    const resetToken = generatePasswordResetToken(user);
    const response = {
      message: 'Se o email existir, você receberá instruções para redefinir sua senha'
    };

    if (process.env.NODE_ENV !== 'production') {
      response.resetToken = resetToken;
    }

    return response;
  }

  async resetPassword(token, newPassword) {
    let payload;
    try {
      payload = verifyPasswordResetToken(token);
    } catch (error) {
      throw new Error('Token de redefinição inválido');
    }

    const user = await userRepository.findById(payload.id);
    if (!user || !user.ativo) {
      throw new Error('Usuário inválido');
    }

    const senhaHash = await bcrypt.hash(newPassword, 10);
    await userRepository.updatePassword(payload.id, senhaHash);
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user || !user.ativo) {
      throw new Error('Usuário inválido');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.senha_hash);
    if (!isMatch) {
      throw new Error('Senha atual inválida');
    }

    const senhaHash = await bcrypt.hash(newPassword, 10);
    await userRepository.updatePassword(userId, senhaHash);
  }
}

module.exports = new AuthService();
