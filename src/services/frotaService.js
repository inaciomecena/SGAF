const frotaRepository = require('../repositories/frotaRepository');

const frotaService = {
  // Veículos
  listarVeiculos: async (codigoIbge) => {
    return await frotaRepository.listarVeiculos(codigoIbge);
  },

  criarVeiculo: async (dados) => {
    // Validações básicas se necessário
    return await frotaRepository.criarVeiculo(dados);
  },

  atualizarVeiculo: async (id, dados) => {
    return await frotaRepository.atualizarVeiculo(id, dados);
  },

  removerVeiculo: async (id) => {
    return await frotaRepository.removerVeiculo(id);
  },

  // Abastecimentos
  listarAbastecimentos: async (veiculoId) => {
    return await frotaRepository.listarAbastecimentos(veiculoId);
  },

  registrarAbastecimento: async (dados) => {
    // Ao registrar abastecimento, atualiza o odômetro do veículo se for maior que o atual
    const veiculo = await frotaRepository.getVeiculoById(dados.veiculo_id);
    if (veiculo && dados.odometro > veiculo.odometro_atual) {
      await frotaRepository.atualizarOdometro(dados.veiculo_id, dados.odometro);
    }
    return await frotaRepository.registrarAbastecimento(dados);
  },

  // Transporte em Atendimento
  vincularAtendimento: async (atendimentoId, dadosTransporte) => {
    const { veiculo_id, km_chegada } = dadosTransporte;
    
    // Calcula KM percorrido se não vier
    let km_percorrido = dadosTransporte.km_percorrido;
    if (!km_percorrido && dadosTransporte.km_saida && km_chegada) {
      km_percorrido = km_chegada - dadosTransporte.km_saida;
    }

    // Registra o vínculo
    const result = await frotaRepository.vincularAtendimento({
      atendimento_id: atendimentoId,
      veiculo_id,
      km_saida: dadosTransporte.km_saida,
      km_chegada,
      km_percorrido
    });

    // Atualiza odômetro do veículo
    if (km_chegada) {
      const veiculo = await frotaRepository.getVeiculoById(veiculo_id);
      if (veiculo && km_chegada > veiculo.odometro_atual) {
        await frotaRepository.atualizarOdometro(veiculo_id, km_chegada);
      }
    }

    return result;
  },
  
  getTransporte: async (atendimentoId) => {
    return await frotaRepository.getTransporteByAtendimentoId(atendimentoId);
  }
};

module.exports = frotaService;
