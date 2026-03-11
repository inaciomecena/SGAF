const authService = require('../services/authService');
const logService = require('../services/logService');

const obterIpCliente = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip;
};

class AuthController {
  async login(req, res) {
    try {
      const { email, password, senha } = req.body;
      const rawPassword = password || senha;
      
      if (!email || !rawPassword) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios' });
      }

      const result = await authService.login(email, rawPassword);
      await logService.registrarAcesso({
        usuario_id: result.user.id,
        ip: obterIpCliente(req),
        user_agent: req.headers['user-agent'] || null
      });
      res.json(result);
    } catch (error) {
      if (error.message === 'Credenciais inválidas') {
        return res.status(401).json({ message: error.message });
      }
      console.error(error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async refresh(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token é obrigatório' });
      }

      const result = await authService.refresh(refreshToken);
      res.json(result);
    } catch (error) {
      if (error.message === 'Refresh token inválido' || error.message === 'Usuário inválido') {
        return res.status(401).json({ message: 'Não autorizado' });
      }
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async logout(req, res) {
    await logService.registrarSistema({
      usuario_id: req.user?.id,
      acao: 'LOGOUT',
      tabela: 'usuarios',
      registro_id: req.user?.id
    });
    res.status(204).send();
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: 'Email é obrigatório' });
      }

      const result = await authService.forgotPassword(email);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token e nova senha são obrigatórios' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Nova senha deve ter ao menos 6 caracteres' });
      }

      await authService.resetPassword(token, newPassword);
      res.status(204).send();
    } catch (error) {
      if (error.message === 'Token de redefinição inválido' || error.message === 'Usuário inválido') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Nova senha deve ter ao menos 6 caracteres' });
      }

      await authService.changePassword(req.user.id, currentPassword, newPassword);
      res.status(204).send();
    } catch (error) {
      if (error.message === 'Senha atual inválida' || error.message === 'Usuário inválido') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async me(req, res) {
    res.json({ user: req.user });
  }
}

module.exports = new AuthController();
