const recursoService = require('../services/recursoService');

class RecursoController {
  // --- MÁQUINAS ---
  async listarMaquinas(req, res) {
    try {
      const maquinas = await recursoService.listarMaquinas(req.tenantId);
      res.json(maquinas);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao listar máquinas' });
    }
  }

  async criarMaquina(req, res) {
    try {
      const id = await recursoService.criarMaquina({ ...req.body, codigo_ibge: req.tenantId });
      res.status(201).json({ id, message: 'Máquina cadastrada' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar máquina' });
    }
  }

  async listarOperadores(req, res) {
    try {
      const operadores = await recursoService.listarOperadores(req.tenantId);
      res.json(operadores);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao listar operadores' });
    }
  }

  async criarOperador(req, res) {
    try {
      const id = await recursoService.criarOperador({ ...req.body, codigo_ibge: req.tenantId });
      res.status(201).json({ id, message: 'Operador cadastrado' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar operador' });
    }
  }

  async criarAgendamento(req, res) {
    try {
      const id = await recursoService.criarAgendamento(req.body);
      res.status(201).json({ id, message: 'Agendamento criado' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar agendamento' });
    }
  }
  
  async listarAgendamentos(req, res) {
    try {
      const agendamentos = await recursoService.listarAgendamentos(req.tenantId);
      res.json(agendamentos);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao listar agendamentos' });
    }
  }

  // --- PROGRAMAS ---
  async listarProgramas(req, res) {
    try {
      const programas = await recursoService.listarProgramas(req.tenantId);
      res.json(programas);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao listar programas' });
    }
  }

  async criarPrograma(req, res) {
    try {
      const id = await recursoService.criarPrograma({ ...req.body, codigo_ibge: req.tenantId });
      res.status(201).json({ id, message: 'Programa criado' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar programa' });
    }
  }

  // --- INSUMOS ---
  async listarInsumos(req, res) {
    try {
      const insumos = await recursoService.listarInsumos(req.tenantId);
      res.json(insumos);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao listar insumos' });
    }
  }

  async criarInsumo(req, res) {
    try {
      const id = await recursoService.criarInsumo({ ...req.body, codigo_ibge: req.tenantId });
      res.status(201).json({ id, message: 'Insumo criado' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar insumo' });
    }
  }

  async movimentarEstoque(req, res) {
    try {
      await recursoService.movimentarEstoque(req.body);
      res.json({ message: 'Movimentação registrada' });
    } catch (error) {
      res.status(400).json({ message: error.message || 'Erro ao movimentar estoque' });
    }
  }

  // --- EVENTOS ---
  async listarEventos(req, res) {
    try {
      const eventos = await recursoService.listarEventos(req.tenantId);
      res.json(eventos);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao listar eventos' });
    }
  }

  async criarEvento(req, res) {
    try {
      const id = await recursoService.criarEvento({ ...req.body, codigo_ibge: req.tenantId });
      res.status(201).json({ id, message: 'Evento criado' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar evento' });
    }
  }
}

module.exports = new RecursoController();
