const userService = require('../services/userService');

class UserController {
  async criar(req, res) {
    try {
      const { nome, email, senha, perfil, codigo_ibge, telefone } = req.body;
      
      // Validação básica
      if (!nome || !email || !senha || !perfil) {
        return res.status(400).json({ message: 'Dados obrigatórios faltando' });
      }

      // Se não for ADMIN_ESTADO, exige codigo_ibge
      if (perfil !== 'ADMIN_ESTADO' && !codigo_ibge) {
        return res.status(400).json({ message: 'Código IBGE obrigatório para este perfil' });
      }

      const id = await userService.criarUsuario({ nome, email, senha, perfil, codigo_ibge, telefone });
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
      // Pega o codigo_ibge do token (injetado pelo tenantMiddleware)
      // Se for ADMIN_ESTADO e passar codigo_ibge na query, usa o da query, senão usa o do token
      let codigoIbge = req.tenantId;

      if (req.user.perfil === 'ADMIN_ESTADO' && req.query.codigo_ibge) {
        codigoIbge = req.query.codigo_ibge;
      }

      if (!codigoIbge && req.user.perfil !== 'ADMIN_ESTADO') {
        return res.status(400).json({ message: 'Contexto de município não definido' });
      }

      // Se for ADMIN_ESTADO sem filtro, pode retornar erro ou listar todos (implementar listarTodos se precisar)
      if (!codigoIbge) {
         return res.status(400).json({ message: 'Informe o código IBGE para listar usuários' });
      }

      const usuarios = await userService.listarPorMunicipio(codigoIbge);
      res.json(usuarios);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao listar usuários' });
    }
  }
}

module.exports = new UserController();
