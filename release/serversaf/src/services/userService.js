const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');
const { normalizeRole } = require('../utils/roles');

class UserService {
  async criarUsuario(dados) {
    const usuarioExistente = await userRepository.findByEmailAnyStatus(dados.email);
    if (usuarioExistente) {
      throw new Error('Email já cadastrado');
    }

    const salt = await bcrypt.genSalt(10);
    const senha_hash = await bcrypt.hash(dados.senha, salt);

    const novoUsuario = {
      ...dados,
      perfil: normalizeRole(dados.perfil),
      senha_hash
    };

    return await userRepository.create(novoUsuario);
  }

  async listarPorMunicipio(codigoIbge) {
    const usuarios = await userRepository.findAllByIbge(codigoIbge);
    return usuarios.map((usuario) => ({
      ...usuario,
      perfil: normalizeRole(usuario.perfil)
    }));
  }

  async listarTodos() {
    const usuarios = await userRepository.findAllActive();
    return usuarios.map((usuario) => ({
      ...usuario,
      perfil: normalizeRole(usuario.perfil)
    }));
  }

  async buscarUsuarioPorId(id) {
    const usuario = await userRepository.findById(id);
    if (!usuario || !usuario.ativo) {
      throw new Error('Usuário não encontrado');
    }

    return {
      ...usuario,
      perfil: normalizeRole(usuario.perfil)
    };
  }

  async atualizarUsuario(id, dados) {
    const usuarioAtual = await userRepository.findById(id);
    if (!usuarioAtual || !usuarioAtual.ativo) {
      throw new Error('Usuário não encontrado');
    }

    const emailDesejado = (dados.email || usuarioAtual.email).trim();
    const usuarioMesmoEmail = await userRepository.findByEmailAnyStatus(emailDesejado);
    if (usuarioMesmoEmail && usuarioMesmoEmail.id !== Number(id)) {
      throw new Error('Email já cadastrado');
    }

    let senhaHash;
    if (dados.senha && dados.senha.trim()) {
      const salt = await bcrypt.genSalt(10);
      senhaHash = await bcrypt.hash(dados.senha, salt);
    }

    const payload = {
      codigo_ibge: dados.codigo_ibge ?? usuarioAtual.codigo_ibge,
      nome: dados.nome?.trim() || usuarioAtual.nome,
      email: emailDesejado,
      perfil: normalizeRole(dados.perfil || usuarioAtual.perfil),
      telefone: dados.telefone ?? usuarioAtual.telefone,
      senha_hash: senhaHash
    };

    await userRepository.update(id, payload);

    return this.buscarUsuarioPorId(id);
  }

  async desativarUsuario(id) {
    const usuario = await userRepository.findById(id);
    if (!usuario || !usuario.ativo) {
      throw new Error('Usuário não encontrado');
    }

    await userRepository.deactivate(id);
  }
}

module.exports = new UserService();
