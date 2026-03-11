const municipioService = require('../services/municipioService');
const { normalizeRole, isAdminEstado } = require('../utils/roles');

class MunicipioController {
  async listar(req, res) {
    try {
      const perfil = normalizeRole(req.user?.perfil);
      if (isAdminEstado(perfil)) {
        const municipios = await municipioService.listarTodos();
        return res.json(municipios);
      }

      const codigoIbge = req.user?.codigo_ibge;
      if (!codigoIbge) {
        return res.status(400).json({ message: 'Contexto de município não definido' });
      }

      const municipio = await municipioService.buscarPorIbge(codigoIbge);
      return res.json(municipio ? [municipio] : []);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao listar municípios' });
    }
  }

  async criar(req, res) {
    try {
      const perfil = normalizeRole(req.user?.perfil);
      if (!isAdminEstado(perfil)) {
        return res.status(403).json({ message: 'Apenas administração estadual pode criar município' });
      }

      const id = await municipioService.criar(req.body);
      return res.status(201).json({ id, message: 'Município criado com sucesso' });
    } catch (error) {
      if (error.message.includes('já cadastrado')) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Erro ao criar município' });
    }
  }

  async meusDados(req, res) {
    try {
      const codigoIbge = req.tenantId || req.user?.codigo_ibge;
      if (!codigoIbge) {
        return res.status(400).json({ message: 'Contexto de município não definido' });
      }

      const resultado = await municipioService.buscarMeusDados(codigoIbge);
      if (resultado?.dados?.servicos_prestados_json) {
        try {
          resultado.dados.servicos_prestados = JSON.parse(resultado.dados.servicos_prestados_json);
        } catch (error) {
          resultado.dados.servicos_prestados = [];
        }
      } else if (resultado?.dados) {
        resultado.dados.servicos_prestados = [];
      }

      if (resultado?.dados) {
        delete resultado.dados.servicos_prestados_json;
      }

      return res.json(resultado);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao carregar dados da secretaria' });
    }
  }

  async salvarMeusDados(req, res) {
    try {
      const codigoIbge = req.tenantId || req.user?.codigo_ibge;
      if (!codigoIbge) {
        return res.status(400).json({ message: 'Contexto de município não definido' });
      }

      const resultado = await municipioService.salvarMeusDados(codigoIbge, req.body);
      if (resultado?.dados?.servicos_prestados_json) {
        try {
          resultado.dados.servicos_prestados = JSON.parse(resultado.dados.servicos_prestados_json);
        } catch (error) {
          resultado.dados.servicos_prestados = [];
        }
      } else if (resultado?.dados) {
        resultado.dados.servicos_prestados = [];
      }

      if (resultado?.dados) {
        delete resultado.dados.servicos_prestados_json;
      }

      return res.json({ message: 'Meus Dados atualizados com sucesso', ...resultado });
    } catch (error) {
      if (error.message.includes('Quantidade de concursados')) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Erro ao salvar dados da secretaria' });
    }
  }
}

module.exports = new MunicipioController();
