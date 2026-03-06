const maquinaRepository = require('../repositories/maquinaRepository');
const agendamentoRepository = require('../repositories/agendamentoRepository');
const programaRepository = require('../repositories/programaRepository');
const insumoRepository = require('../repositories/insumoRepository');
const eventoRepository = require('../repositories/eventoRepository');

class RecursoService {
  // --- MÁQUINAS ---
  async listarMaquinas(codigoIbge) {
    return await maquinaRepository.findAllByIbge(codigoIbge);
  }
  
  async criarMaquina(dados) {
    return await maquinaRepository.create(dados);
  }
  
  async listarOperadores(codigoIbge) {
    return await maquinaRepository.findAllOperadores(codigoIbge);
  }
  
  async criarOperador(dados) {
    return await maquinaRepository.createOperador(dados);
  }
  
  async registrarManutencao(dados) {
    return await maquinaRepository.createManutencao(dados);
  }
  
  async listarAgendamentos(codigoIbge) {
    return await agendamentoRepository.findAllByIbge(codigoIbge);
  }
  
  async criarAgendamento(dados) {
    // Aqui poderia validar disponibilidade da máquina
    return await agendamentoRepository.create(dados);
  }

  // --- PROGRAMAS ---
  async listarProgramas(codigoIbge) {
    return await programaRepository.findAllByIbge(codigoIbge);
  }
  
  async criarPrograma(dados) {
    return await programaRepository.create(dados);
  }
  
  async registrarBeneficiario(dados) {
    return await programaRepository.registrarBeneficiario(dados);
  }

  // --- INSUMOS ---
  async listarInsumos(codigoIbge) {
    const insumos = await insumoRepository.findAllByIbge(codigoIbge);
    // Adicionar saldo atual
    for (let insumo of insumos) {
        insumo.estoque_atual = await insumoRepository.getEstoqueTotal(insumo.id);
    }
    return insumos;
  }
  
  async criarInsumo(dados) {
    return await insumoRepository.create(dados);
  }
  
  async movimentarEstoque(dados) {
    // tipo: 'ENTRADA' ou 'SAIDA'
    if (dados.tipo === 'ENTRADA') {
        return await insumoRepository.adicionarEstoque(dados);
    } else if (dados.tipo === 'SAIDA') {
        // Validar estoque suficiente antes?
        const saldo = await insumoRepository.getEstoqueTotal(dados.insumo_id);
        if (saldo < dados.quantidade) {
            throw new Error('Estoque insuficiente');
        }
        return await insumoRepository.registrarDistribuicao(dados);
    }
  }

  // --- EVENTOS ---
  async listarEventos(codigoIbge) {
    return await eventoRepository.findAllByIbge(codigoIbge);
  }
  
  async criarEvento(dados) {
    return await eventoRepository.create(dados);
  }
  
  async registrarParticipante(eventoId, produtorId) {
    return await eventoRepository.addParticipante(eventoId, produtorId);
  }
}

module.exports = new RecursoService();
