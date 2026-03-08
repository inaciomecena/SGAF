const atendimentoRepository = require('../repositories/atendimentoRepository');
const tecnicoRepository = require('../repositories/tecnicoRepository');
const { normalizeRole } = require('../utils/roles');

class AtendimentoService {
  async listarTecnicos(codigoIbge) {
    return await tecnicoRepository.findAllByIbge(codigoIbge);
  }

  async obterTecnicoValido(tecnicoId, codigoIbge) {
    const tecnico = await tecnicoRepository.findByIdAndIbge(tecnicoId, codigoIbge);
    if (!tecnico) {
      return null;
    }

    const perfilNormalizado = normalizeRole(tecnico.perfil);
    if (perfilNormalizado !== 'TECNICO') {
      return null;
    }

    return tecnico;
  }

  async listarAtendimentos(codigoIbge) {
    return await atendimentoRepository.findAllByIbge(codigoIbge);
  }

  async registrarAtendimento(dadosAtendimento) {
    // Futuramente: Validar se técnico pertence ao município, se produtor existe, etc.
    return await atendimentoRepository.create(dadosAtendimento);
  }

  async historicoProdutor(produtorId) {
    return await atendimentoRepository.findByProdutor(produtorId);
  }

  async detalharAtendimento(id) {
    const atendimento = await atendimentoRepository.findById(id);
    if (atendimento) {
      atendimento.fotos = await atendimentoRepository.getFotos(id);
    }
    return atendimento;
  }
}

module.exports = new AtendimentoService();
