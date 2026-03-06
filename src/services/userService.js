const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');

class UserService {
  async criarUsuario(dados) {
    const usuarioExistente = await userRepository.findByEmail(dados.email);
    if (usuarioExistente) {
      throw new Error('Email já cadastrado');
    }

    const salt = await bcrypt.genSalt(10);
    const senha_hash = await bcrypt.hash(dados.senha, salt);

    const novoUsuario = {
      ...dados,
      senha_hash
    };

    return await userRepository.create(novoUsuario);
  }

  async listarPorMunicipio(codigoIbge) {
    return await userRepository.findAllByIbge(codigoIbge);
  }
}

module.exports = new UserService();
