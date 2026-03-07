const municipioRepository = require('../repositories/municipioRepository');

class MunicipioService {
  toInteger(value) {
    if (value === '' || value === undefined || value === null) {
      return null;
    }
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }

  toDecimal(value) {
    if (value === '' || value === undefined || value === null) {
      return null;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  toBoolean(value) {
    if (value === true || value === false) return value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 1 || value === '1') return true;
    if (value === 0 || value === '0') return false;
    return false;
  }

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

  async buscarMeusDados(codigoIbge) {
    await municipioRepository.ensureMeusDadosSchema();
    const municipio = await municipioRepository.findByCodigoIbge(codigoIbge);
    const dados = await municipioRepository.findMeusDadosByCodigoIbge(codigoIbge);

    return {
      municipio: municipio || null,
      dados: dados || null
    };
  }

  async salvarMeusDados(codigoIbge, payload) {
    await municipioRepository.ensureMeusDadosSchema();
    const qtdServidores = this.toInteger(payload.qtd_servidores) || 0;
    const qtdConcursados = this.toInteger(payload.qtd_servidores_concursados) || 0;

    if (qtdConcursados > qtdServidores) {
      throw new Error('Quantidade de concursados não pode ser maior que o total de servidores');
    }

    const possuiFundoMunicipal = this.toBoolean(payload.possui_fundo_municipal);
    const projetosComEmpaer = this.toBoolean(payload.projetos_com_empaer);
    const servidorMunicipioCedidoEmpaer = this.toBoolean(payload.servidor_municipio_cedido_empaer);
    const servidorEmpaerCedidoMunicipio = this.toBoolean(payload.servidor_empaer_cedido_municipio);

    const dados = {
      nome_secretaria: payload.nome_secretaria || '',
      endereco: payload.endereco || '',
      numero: this.toInteger(payload.numero),
      bairro: payload.bairro || '',
      cep: payload.cep || '',
      email: payload.email || '',
      telefone: payload.telefone || '',
      responsavel_nome: payload.responsavel_nome || '',
      responsavel_cargo: payload.responsavel_cargo || '',
      responsavel_telefone: payload.responsavel_telefone || '',
      responsavel_email: payload.responsavel_email || '',
      qtd_servidores: qtdServidores,
      qtd_servidores_concursados: qtdConcursados,
      possui_fundo_municipal: possuiFundoMunicipal,
      fundo_tipo_publicacao: possuiFundoMunicipal ? (payload.fundo_tipo_publicacao || null) : null,
      fundo_numero_publicacao: possuiFundoMunicipal ? (payload.fundo_numero_publicacao || null) : null,
      fundo_data_publicacao: possuiFundoMunicipal ? (payload.fundo_data_publicacao || null) : null,
      fundo_orcamento_anual: possuiFundoMunicipal ? this.toDecimal(payload.fundo_orcamento_anual) : null,
      fundo_percentual_orcamento: possuiFundoMunicipal ? this.toInteger(payload.fundo_percentual_orcamento) : null,
      possui_escritorio_empaer: this.toBoolean(payload.possui_escritorio_empaer),
      projetos_com_empaer: projetosComEmpaer,
      projetos_empaer_texto: projetosComEmpaer ? (payload.projetos_empaer_texto || null) : null,
      servidor_municipio_cedido_empaer: servidorMunicipioCedidoEmpaer,
      servidores_municipio_cedidos: servidorMunicipioCedidoEmpaer ? (payload.servidores_municipio_cedidos || null) : null,
      servidor_empaer_cedido_municipio: servidorEmpaerCedidoMunicipio,
      servidores_empaer_cedidos: servidorEmpaerCedidoMunicipio ? (payload.servidores_empaer_cedidos || null) : null,
      possui_escritorio_indea: this.toBoolean(payload.possui_escritorio_indea),
      possui_unidade_senar: this.toBoolean(payload.possui_unidade_senar),
      servicos_prestados_json: JSON.stringify(Array.isArray(payload.servicos_prestados) ? payload.servicos_prestados : [])
    };

    await municipioRepository.upsertMeusDados(codigoIbge, dados);
    return await this.buscarMeusDados(codigoIbge);
  }
}

module.exports = new MunicipioService();
