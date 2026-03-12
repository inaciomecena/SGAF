const fs = require('fs');
const path = require('path');
const atendimentoRepository = require('../repositories/atendimentoRepository');
const tecnicoRepository = require('../repositories/tecnicoRepository');
const frotaService = require('./frotaService');
const { normalizeRole } = require('../utils/roles');

class AtendimentoService {
  async ensureReady() {
    await atendimentoRepository.ensureSchema();
  }

  async listarTecnicos(codigoIbge) {
    await this.ensureReady();
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
    await this.ensureReady();
    return await atendimentoRepository.findAllByIbge(codigoIbge);
  }

  async registrarAtendimento(dadosAtendimento) {
    await this.ensureReady();
    // Futuramente: Validar se técnico pertence ao município, se produtor existe, etc.
    const atendimentoId = await atendimentoRepository.create(dadosAtendimento);

    // Se houver dados de transporte/veículo, registra o vínculo
    if (dadosAtendimento.veiculo_id) {
      try {
        await frotaService.vincularAtendimento(atendimentoId, {
          veiculo_id: dadosAtendimento.veiculo_id,
          km_saida: dadosAtendimento.km_saida,
          km_chegada: dadosAtendimento.km_chegada,
          km_percorrido: dadosAtendimento.km_percorrido
        });
      } catch (error) {
        console.error('Erro ao vincular veículo ao atendimento:', error);
        // Não falha o atendimento se o vínculo do veículo falhar, apenas loga
      }
    }

    return atendimentoId;
  }

  async historicoProdutor(produtorId) {
    await this.ensureReady();
    return await atendimentoRepository.findByProdutor(produtorId);
  }

  async detalharAtendimento(id) {
    await this.ensureReady();
    const atendimento = await atendimentoRepository.findById(id);
    if (atendimento) {
      atendimento.fotos = await atendimentoRepository.getFotos(id);
      atendimento.transporte = await frotaService.getTransporte(id);
    }
    return atendimento;
  }

  async atualizarKmChegada({ atendimentoId, kmChegada }) {
    await this.ensureReady();

    const transporteAtual = await frotaService.getTransporte(atendimentoId);
    if (!transporteAtual) {
      throw new Error('Atendimento não possui deslocamento.');
    }

    const kmChegadaNum = Number.parseInt(String(kmChegada), 10);
    if (!Number.isFinite(kmChegadaNum)) {
      throw new Error('Informe o KM de chegada.');
    }

    const kmSaida = transporteAtual.km_saida ?? null;
    if (kmSaida !== null && kmChegadaNum < kmSaida) {
      throw new Error('KM de chegada não pode ser menor que o KM de saída.');
    }

    await frotaService.vincularAtendimento(atendimentoId, {
      veiculo_id: transporteAtual.veiculo_id,
      km_saida: kmSaida,
      km_chegada: kmChegadaNum
    });

    return await frotaService.getTransporte(atendimentoId);
  }

  async adicionarFoto(atendimentoId, arquivo) {
    await this.ensureReady();
    await atendimentoRepository.addFoto(atendimentoId, arquivo);
  }

  async removerFoto(fotoId) {
    await this.ensureReady();
    const foto = await atendimentoRepository.getFotoById(fotoId);
    if (!foto) {
      return null;
    }
    await atendimentoRepository.removeFoto(fotoId);

    // Remover arquivo físico
    if (foto.arquivo) {
      try {
        const filePath = path.resolve(__dirname, '../../', foto.arquivo.startsWith('/') ? foto.arquivo.substring(1) : foto.arquivo);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.error('Erro ao remover arquivo físico:', err);
      }
    }
    return foto;
  }
}

module.exports = new AtendimentoService();
