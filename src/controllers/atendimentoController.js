const atendimentoService = require('../services/atendimentoService');

class AtendimentoController {
  async listarTecnicos(req, res) {
    try {
      const tecnicos = await atendimentoService.listarTecnicos(req.tenantId);
      res.json(tecnicos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao listar técnicos' });
    }
  }

  async listar(req, res) {
    try {
      const atendimentos = await atendimentoService.listarAtendimentos(req.tenantId);
      res.json(atendimentos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao listar atendimentos' });
    }
  }

  async registrar(req, res) {
    try {
      const { tecnico_id: tecnicoIdInformado, ...dados } = req.body;
      const codigo_ibge = req.tenantId;
      const tecnico_id = tecnicoIdInformado ? Number(tecnicoIdInformado) : Number(req.user.id);

      if (!Number.isInteger(tecnico_id) || tecnico_id <= 0) {
        return res.status(400).json({ message: 'tecnico_id inválido' });
      }

      const tecnico = await atendimentoService.obterTecnicoValido(tecnico_id, codigo_ibge);
      if (!tecnico) {
        return res.status(400).json({ message: 'tecnico_id deve ser de um usuário com perfil técnico do município' });
      }

      const id = await atendimentoService.registrarAtendimento({
        ...dados,
        codigo_ibge,
        tecnico_id
      });

      res.status(201).json({ id, message: 'Atendimento registrado com sucesso' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao registrar atendimento' });
    }
  }

  async historicoProdutor(req, res) {
    try {
      const { produtorId } = req.params;
      const historico = await atendimentoService.historicoProdutor(produtorId);
      res.json(historico);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar histórico' });
    }
  }

  async detalhar(req, res) {
    try {
      const { id } = req.params;
      const atendimento = await atendimentoService.detalharAtendimento(id);
      
      if (!atendimento) {
        return res.status(404).json({ message: 'Atendimento não encontrado' });
      }

      // Verificação de segurança simples (idealmente validar codigo_ibge também)
      if (atendimento.codigo_ibge !== req.tenantId) {
         return res.status(403).json({ message: 'Acesso negado' });
      }

      res.json(atendimento);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar atendimento' });
    }
  }
}

module.exports = new AtendimentoController();
