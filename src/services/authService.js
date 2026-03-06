const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');

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

    const token = generateToken(user);

    // Atualiza ultimo login (opcional, mas recomendado)
    // await userRepository.updateLastLogin(user.id);

    return {
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil,
        codigo_ibge: user.codigo_ibge
      }
    };
  }
}

module.exports = new AuthService();
