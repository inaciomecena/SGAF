const municipioRepository = require('../repositories/municipioRepository');

class MunicipioService {
  async listarTodos() {
    return await municipioRepository.findAll();
  }

  async criar(dados) {
    const existe = await municipioRepository.findByCodigoIbge(dados.codigo_ibge);
    if (existe) {
      throw new Error('Município já cadastrado com este código IBGE');
    }
    return await municipioRepository.create(dados);
  }

  async buscarPorIbge(codigoIbge) {
    return await municipioRepository.findByCodigoIbge(codigoIbge);
  }
}

module.exports = new MunicipioService();
