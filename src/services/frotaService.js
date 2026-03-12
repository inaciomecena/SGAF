const frotaRepository = require('../repositories/frotaRepository');

const frotaService = {
  ensureReady: async () => {
    await frotaRepository.ensureSchema();
  },

  // Veículos
  listarVeiculos: async (codigoIbge) => {
    await frotaService.ensureReady();
    return await frotaRepository.listarVeiculos(codigoIbge);
  },

  criarVeiculo: async (dados) => {
    await frotaService.ensureReady();
    // Validações básicas se necessário
    return await frotaRepository.criarVeiculo(dados);
  },

  atualizarVeiculo: async (id, dados) => {
    await frotaService.ensureReady();
    return await frotaRepository.atualizarVeiculo(id, dados);
  },

  removerVeiculo: async (id) => {
    await frotaService.ensureReady();
    return await frotaRepository.removerVeiculo(id);
  },

  // Abastecimentos
  listarAbastecimentos: async (veiculoId) => {
    await frotaService.ensureReady();
    return await frotaRepository.listarAbastecimentos(veiculoId);
  },

  registrarAbastecimento: async (dados) => {
    await frotaService.ensureReady();
    // Ao registrar abastecimento, atualiza o odômetro do veículo se for maior que o atual
    const veiculo = await frotaRepository.getVeiculoById(dados.veiculo_id);
    if (veiculo && dados.odometro > veiculo.odometro_atual) {
      await frotaRepository.atualizarOdometro(dados.veiculo_id, dados.odometro);
    }
    return await frotaRepository.registrarAbastecimento(dados);
  },

  // Transporte em Atendimento
  vincularAtendimento: async (atendimentoId, dadosTransporte) => {
    await frotaService.ensureReady();
    const veiculoId = Number.parseInt(String(dadosTransporte.veiculo_id), 10);
    if (!Number.isFinite(veiculoId)) {
      throw new Error('veiculo_id inválido');
    }

    const parseKm = (value) => {
      if (value === null || value === undefined) return null;
      const raw = String(value).trim();
      if (!raw) return null;
      const num = Number.parseInt(raw, 10);
      return Number.isFinite(num) ? num : null;
    };

    const kmSaida = parseKm(dadosTransporte.km_saida);
    const kmChegada = parseKm(dadosTransporte.km_chegada);
    
    // Calcula KM percorrido se não vier
    let kmPercorrido = parseKm(dadosTransporte.km_percorrido);
    if (kmPercorrido === null && kmSaida !== null && kmChegada !== null) {
      kmPercorrido = kmChegada - kmSaida;
    }

    // Registra o vínculo
    const result = await frotaRepository.vincularAtendimento({
      atendimento_id: atendimentoId,
      veiculo_id: veiculoId,
      km_saida: kmSaida,
      km_chegada: kmChegada,
      km_percorrido: kmPercorrido
    });

    // Atualiza odômetro do veículo
    if (kmChegada !== null) {
      const veiculo = await frotaRepository.getVeiculoById(veiculoId);
      if (veiculo && kmChegada > veiculo.odometro_atual) {
        await frotaRepository.atualizarOdometro(veiculoId, kmChegada);
      }
    }

    return result;
  },
  
  getTransporte: async (atendimentoId) => {
    await frotaService.ensureReady();
    return await frotaRepository.getTransporteByAtendimentoId(atendimentoId);
  }
};

module.exports = frotaService;
