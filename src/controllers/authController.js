const authService = require('../services/authService');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios' });
      }

      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      console.error(error);
      if (error.message === 'Credenciais inválidas') {
        return res.status(401).json({ message: error.message });
      }
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async me(req, res) {
    // Rota para verificar token e retornar dados do usuário atual
    // O middleware de auth já colocou o user no req.user
    res.json({ user: req.user });
  }
}

module.exports = new AuthController();
