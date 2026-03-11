const userService = require('../services/userService');
const logService = require('../services/logService');
const { normalizeRole, allowedProfilesToCreate, isAdminEstado } = require('../utils/roles');

class UserController {
  validarEscopoMunicipal(req, codigoIbgeDestino) {
    const perfilSolicitante = normalizeRole(req.user?.perfil);
    if (!isAdminEstado(perfilSolicitante) && codigoIbgeDestino !== req.user.codigo_ibge) {
      return false;
    }
    return true;
  }

  podeGerenciarPerfil(req, perfilAlvo) {
    const perfilSolicitante = normalizeRole(req.user?.perfil);
    const perfisPermitidos = allowedProfilesToCreate(perfilSolicitante);
    return perfisPermitidos.includes(normalizeRole(perfilAlvo));
  }

  async criar(req, res) {
    try {
      const { nome, email, senha, perfil, codigo_ibge, telefone } = req.body;

      if (!nome || !email || !senha || !perfil) {
        return res.status(400).json({ message: 'Dados obrigatórios faltando' });
      }

      const perfilNormalizado = normalizeRole(perfil);
      if (req.user && !this.podeGerenciarPerfil(req, perfilNormalizado)) {
        return res.status(403).json({ message: 'Perfil sem permissão para criar este tipo de usuário' });
      }

      const codigoIbgeDestino = perfilNormalizado === 'ADMIN_ESTADO'
        ? null
        : (codigo_ibge || req.user?.codigo_ibge);

      if (perfilNormalizado !== 'ADMIN_ESTADO' && !codigoIbgeDestino) {
        return res.status(400).json({ message: 'Código IBGE obrigatório para este perfil' });
      }

      if (req.user && !this.validarEscopoMunicipal(req, codigoIbgeDestino)) {
        return res.status(403).json({ message: 'Você só pode criar usuários no seu município' });
      }

      const id = await userService.criarUsuario({
        nome,
        email,
        senha,
        perfil: perfilNormalizado,
        codigo_ibge: codigoIbgeDestino,
        telefone
      });
      await logService.registrarSistema({
        usuario_id: req.user?.id,
        acao: 'CRIAR_USUARIO',
        tabela: 'usuarios',
        registro_id: id
      });
      res.status(201).json({ id, message: 'Usuário criado com sucesso' });
    } catch (error) {
      if (error.message === 'Email já cadastrado') {
        return res.status(400).json({ message: error.message });
      }
      console.error(error);
      res.status(500).json({ message: 'Erro ao criar usuário' });
    }
  }

  async listar(req, res) {
    try {
      let codigoIbge = req.tenantId;
      const perfil = normalizeRole(req.user.perfil);
      const isEstado = perfil === 'ADMIN_ESTADO';

      if (isEstado && req.query.codigo_ibge) {
        codigoIbge = req.query.codigo_ibge;
      }

      if (!codigoIbge && !isEstado) {
        return res.status(400).json({ message: 'Contexto de município não definido' });
      }

      if (isEstado && !codigoIbge) {
        const usuarios = await userService.listarTodos();
        return res.json(usuarios);
      }

      const usuarios = await userService.listarPorMunicipio(codigoIbge);
      res.json(usuarios);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao listar usuários' });
    }
  }

  async detalhar(req, res) {
    try {
      const { id } = req.params;
      const usuario = await userService.buscarUsuarioPorId(id);

      if (!this.podeGerenciarPerfil(req, usuario.perfil)) {
        return res.status(403).json({ message: 'Perfil sem permissão para visualizar este usuário' });
      }

      if (!this.validarEscopoMunicipal(req, usuario.codigo_ibge)) {
        return res.status(403).json({ message: 'Você só pode visualizar usuários do seu município' });
      }

      res.json(usuario);
    } catch (error) {
      if (error.message === 'Usuário não encontrado') {
        return res.status(404).json({ message: error.message });
      }
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar usuário' });
    }
  }

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, email, senha, perfil, codigo_ibge, telefone } = req.body;

      const usuarioAtual = await userService.buscarUsuarioPorId(id);
      if (!this.podeGerenciarPerfil(req, usuarioAtual.perfil)) {
        return res.status(403).json({ message: 'Perfil sem permissão para editar este usuário' });
      }

      if (!this.validarEscopoMunicipal(req, usuarioAtual.codigo_ibge)) {
        return res.status(403).json({ message: 'Você só pode editar usuários do seu município' });
      }

      const perfilFinal = normalizeRole(perfil || usuarioAtual.perfil);
      if (!this.podeGerenciarPerfil(req, perfilFinal)) {
        return res.status(403).json({ message: 'Perfil sem permissão para atribuir este tipo de usuário' });
      }

      const codigoIbgeFinal = perfilFinal === 'ADMIN_ESTADO'
        ? null
        : (codigo_ibge || usuarioAtual.codigo_ibge);

      if (perfilFinal !== 'ADMIN_ESTADO' && !codigoIbgeFinal) {
        return res.status(400).json({ message: 'Código IBGE obrigatório para este perfil' });
      }

      if (!this.validarEscopoMunicipal(req, codigoIbgeFinal)) {
        return res.status(403).json({ message: 'Você só pode manter usuários no seu município' });
      }

      const usuario = await userService.atualizarUsuario(id, {
        nome,
        email,
        senha,
        perfil: perfilFinal,
        codigo_ibge: codigoIbgeFinal,
        telefone
      });
      await logService.registrarSistema({
        usuario_id: req.user?.id,
        acao: 'ATUALIZAR_USUARIO',
        tabela: 'usuarios',
        registro_id: Number(id)
      });

      res.json({ message: 'Usuário atualizado com sucesso', usuario });
    } catch (error) {
      if (error.message === 'Usuário não encontrado') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === 'Email já cadastrado') {
        return res.status(400).json({ message: error.message });
      }
      console.error(error);
      res.status(500).json({ message: 'Erro ao atualizar usuário' });
    }
  }

  async desativar(req, res) {
    try {
      const { id } = req.params;
      if (Number(id) === Number(req.user.id)) {
        return res.status(400).json({ message: 'Você não pode desativar o próprio usuário' });
      }

      const usuario = await userService.buscarUsuarioPorId(id);
      if (!this.podeGerenciarPerfil(req, usuario.perfil)) {
        return res.status(403).json({ message: 'Perfil sem permissão para desativar este usuário' });
      }

      if (!this.validarEscopoMunicipal(req, usuario.codigo_ibge)) {
        return res.status(403).json({ message: 'Você só pode desativar usuários do seu município' });
      }

      await userService.desativarUsuario(id);
      await logService.registrarSistema({
        usuario_id: req.user?.id,
        acao: 'DESATIVAR_USUARIO',
        tabela: 'usuarios',
        registro_id: Number(id)
      });
      res.json({ message: 'Usuário desativado com sucesso' });
    } catch (error) {
      if (error.message === 'Usuário não encontrado') {
        return res.status(404).json({ message: error.message });
      }
      console.error(error);
      res.status(500).json({ message: 'Erro ao desativar usuário' });
    }
  }
}

module.exports = new UserController();
