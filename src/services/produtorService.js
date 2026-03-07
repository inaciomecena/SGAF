const produtorRepository = require('../repositories/produtorRepository');
const propriedadeRepository = require('../repositories/propriedadeRepository');
const { associacaoRepository, cooperativaRepository } = require('../repositories/organizacaoRepository');

class ProdutorService {
  async listarProdutores(codigoIbge) {
    return await produtorRepository.findAllByIbge(codigoIbge);
  }

  async criarProdutor(dadosProdutor, dadosEndereco) {
    // Aqui poderia validar CPF único por município, etc.
    return await produtorRepository.create(dadosProdutor, dadosEndereco);
  }

  async detalharProdutor(id, codigoIbge) {
    const produtor = await produtorRepository.findById(id, codigoIbge);
    if (produtor) {
      produtor.propriedades = await propriedadeRepository.findAllByProdutor(id, codigoIbge);
    }
    return produtor;
  }

  // Métodos auxiliares para Associações/Cooperativas
  async criarAssociacao(dados) {
    return await associacaoRepository.create(dados);
  }

  async listarAssociacoes(codigoIbge) {
    return await associacaoRepository.findAllByIbge(codigoIbge);
  }
}

module.exports = new ProdutorService();
