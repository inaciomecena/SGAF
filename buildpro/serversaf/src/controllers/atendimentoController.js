const atendimentoService = require('../services/atendimentoService');
const { normalizeRole } = require('../utils/roles');
const syncService = require('../services/syncService');

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

      await syncService.registrarEventoDominio({
        codigoIbge: codigo_ibge,
        entity: 'atendimento',
        recordId: id,
        action: 'create'
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

      const perfil = normalizeRole(req.user?.perfil);
      const podeAcessar = perfil === 'ADMIN_ESTADO' || atendimento.codigo_ibge === req.tenantId;
      if (!podeAcessar) {
         return res.status(403).json({ message: 'Acesso negado' });
      }

      res.json(atendimento);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar atendimento' });
    }
  }

  async anexarFotos(req, res) {
    try {
      const { id } = req.params;
      const atendimento = await atendimentoService.detalharAtendimento(id);

      if (!atendimento) {
        return res.status(404).json({ message: 'Atendimento não encontrado' });
      }

      const perfil = normalizeRole(req.user?.perfil);
      const podeAcessar = perfil === 'ADMIN_ESTADO' || atendimento.codigo_ibge === req.tenantId;
      if (!podeAcessar) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      if (!req.files?.length) {
        return res.status(400).json({ message: 'Nenhuma foto enviada' });
      }

      for (const foto of req.files) {
        await atendimentoService.adicionarFoto(Number(id), `/uploads/atendimentos/${foto.filename}`);
      }

      await syncService.registrarEventoDominio({
        codigoIbge: atendimento.codigo_ibge,
        entity: 'atendimento',
        recordId: Number(id),
        action: 'update'
      });

      const atualizado = await atendimentoService.detalharAtendimento(id);
      res.status(201).json(atualizado);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao anexar fotos' });
    }
  }

  async removerFoto(req, res) {
    try {
      const { id } = req.params;
      const foto = await atendimentoService.removerFoto(id);

      if (!foto) {
        return res.status(404).json({ message: 'Foto não encontrada' });
      }

      await syncService.registrarEventoDominio({
        codigoIbge: req.tenantId, // Assumindo que quem remove tem permissão no tenant
        entity: 'foto_atendimento',
        recordId: Number(id),
        action: 'delete'
      });

      res.status(200).json({ message: 'Foto removida com sucesso' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao remover foto' });
    }
  }
}

module.exports = new AtendimentoController();
