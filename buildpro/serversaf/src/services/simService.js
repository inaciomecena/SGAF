const { canAccessSim, isAdminEstado } = require('../utils/roles');
const municipioRepository = require('../repositories/municipioRepository');
const simRepository = require('../repositories/simRepository');

const parseBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const raw = value.trim().toLowerCase();
    if (raw === 'true' || raw === '1' || raw === 'sim') return true;
    if (raw === 'false' || raw === '0' || raw === 'nao' || raw === 'não') return false;
  }
  return null;
};

const parseIntRequired = (value, fieldLabel) => {
  const num = Number.parseInt(String(value), 10);
  if (!Number.isFinite(num)) {
    throw new Error(`Informe ${fieldLabel}.`);
  }
  return num;
};

const parseDecimalRequired = (value, fieldLabel) => {
  const raw = String(value ?? '').replace(/\./g, '').replace(',', '.');
  const num = Number.parseFloat(raw);
  if (!Number.isFinite(num)) {
    throw new Error(`Informe ${fieldLabel}.`);
  }
  return num;
};

class SimService {
  async ensureReady() {
    await simRepository.ensureSchema();
  }

  resolveCodigoIbge({ user, tenantId, codigoIbgeParam }) {
    if (isAdminEstado(user?.perfil)) {
      if (!codigoIbgeParam) {
        throw new Error('Informe o código IBGE do município.');
      }
      return String(codigoIbgeParam);
    }
    if (!tenantId) {
      throw new Error('Usuário sem vínculo municipal.');
    }
    return String(tenantId);
  }

  async obterTudo({ user, tenantId, codigoIbgeParam, ano }) {
    await this.ensureReady();
    if (!canAccessSim(user?.perfil) && !isAdminEstado(user?.perfil)) {
      throw new Error('Acesso negado.');
    }

    const codigoIbge = this.resolveCodigoIbge({ user, tenantId, codigoIbgeParam });
    const municipio = await municipioRepository.findByCodigoIbge(codigoIbge);

    const anoRef = Number.parseInt(String(ano), 10);
    if (!Number.isFinite(anoRef)) {
      throw new Error('Informe o ano de referência.');
    }

    const info = await simRepository.getInfoByCodigoIbge(codigoIbge);
    const feiras = await simRepository.getFeirasByCodigoIbgeAno(codigoIbge, anoRef);
    const tiposFeiras = await simRepository.getTiposFeirasByCodigoIbgeAno(codigoIbge, anoRef);

    return { municipio, ano: anoRef, info, feiras, tiposFeiras };
  }

  async salvarInfo({ user, tenantId, codigoIbgeParam, body }) {
    await this.ensureReady();
    if (!canAccessSim(user?.perfil) && !isAdminEstado(user?.perfil)) {
      throw new Error('Acesso negado.');
    }

    const codigoIbge = this.resolveCodigoIbge({ user, tenantId, codigoIbgeParam });
    const municipio = await municipioRepository.findByCodigoIbge(codigoIbge);

    const possuiSim = parseBoolean(body?.possui_sim);
    const possuiMedico = parseBoolean(body?.possui_medico_veterinario);
    const aderiuSusaf = parseBoolean(body?.aderiu_susaf);
    const interesseSusaf = parseBoolean(body?.interesse_aderir_susaf);

    if (possuiSim === null) throw new Error('Informe se o município possui SIM implantado.');
    if (possuiMedico === null) throw new Error('Informe se o município possui médico veterinário exclusivo disponível para atender o SIM.');
    if (aderiuSusaf === null) throw new Error('Informe se o município fez adesão ao SUSAF/MT.');
    if (interesseSusaf === null) throw new Error('Informe se o município tem interesse em aderir ao SUSAF/MT.');

    await simRepository.upsertInfoByCodigoIbge(codigoIbge, {
      possui_sim: possuiSim,
      possui_medico_veterinario: possuiMedico,
      aderiu_susaf: aderiuSusaf,
      interesse_aderir_susaf: interesseSusaf
    });

    const info = await simRepository.getInfoByCodigoIbge(codigoIbge);
    return { municipio, info };
  }

  async salvarFeiras({ user, tenantId, codigoIbgeParam, ano, body }) {
    await this.ensureReady();
    if (!canAccessSim(user?.perfil) && !isAdminEstado(user?.perfil)) {
      throw new Error('Acesso negado.');
    }

    const codigoIbge = this.resolveCodigoIbge({ user, tenantId, codigoIbgeParam });
    const municipio = await municipioRepository.findByCodigoIbge(codigoIbge);

    const anoRef = parseIntRequired(ano, 'o ano de referência');
    const qtdAgricultores = parseIntRequired(body?.qtd_agricultores_comercializam, 'a quantidade de agricultores e agricultoras familiares que comercializam nas feiras livres');
    const valorComercializado = parseDecimalRequired(body?.valor_comercializado_anual, 'o valor comercializado (R$) nas feiras livres anualmente');
    const qtdPermanentes = parseIntRequired(body?.qtd_feiras_permanentes, 'a quantidade de feiras permanentes regulares');
    const qtdNaoPermanentes = parseIntRequired(body?.qtd_feiras_nao_permanentes, 'a quantidade de feiras não permanentes regulares');
    const statusColeta = 0;

    await simRepository.upsertFeirasByCodigoIbgeAno(codigoIbge, anoRef, {
      qtd_agricultores_comercializam: qtdAgricultores,
      valor_comercializado_anual: valorComercializado,
      qtd_feiras_permanentes: qtdPermanentes,
      qtd_feiras_nao_permanentes: qtdNaoPermanentes,
      status_coleta: statusColeta
    });

    const feiras = await simRepository.getFeirasByCodigoIbgeAno(codigoIbge, anoRef);
    return { municipio, ano: anoRef, feiras };
  }

  async salvarTipoFeira({ user, tenantId, codigoIbgeParam, ano, tipoFeira, body }) {
    await this.ensureReady();
    if (!canAccessSim(user?.perfil) && !isAdminEstado(user?.perfil)) {
      throw new Error('Acesso negado.');
    }

    const codigoIbge = this.resolveCodigoIbge({ user, tenantId, codigoIbgeParam });
    const municipio = await municipioRepository.findByCodigoIbge(codigoIbge);

    const anoRef = parseIntRequired(ano, 'o ano de referência');
    const tipo = Number.parseInt(String(tipoFeira), 10);
    if (tipo !== 1 && tipo !== 2) {
      throw new Error('Tipo de feira inválido.');
    }

    const payload = {
      qtd_comerciantes_produtores_af: parseIntRequired(body?.qtd_comerciantes_produtores_af, 'o campo 1'),
      qtd_mulheres_comerciantes_produtoras_af: parseIntRequired(body?.qtd_mulheres_comerciantes_produtoras_af, 'o campo 2'),
      qtd_comerciantes_af_revendedores: parseIntRequired(body?.qtd_comerciantes_af_revendedores, 'o campo 3'),
      qtd_mulheres_comerciantes_revendedoras_af: parseIntRequired(body?.qtd_mulheres_comerciantes_revendedoras_af, 'o campo 4'),
      qtd_comerciantes_artesanato: parseIntRequired(body?.qtd_comerciantes_artesanato, 'o campo 5'),
      qtd_mulheres_comerciantes_artesanato: parseIntRequired(body?.qtd_mulheres_comerciantes_artesanato, 'o campo 6'),
      qtd_comerciantes_produtos_industrializados_externos: parseIntRequired(body?.qtd_comerciantes_produtos_industrializados_externos, 'o campo 7'),
      valor_comercializado_anual: parseDecimalRequired(body?.valor_comercializado_anual, 'o campo 8'),
      valor_total_comercializado_af: parseDecimalRequired(body?.valor_total_comercializado_af, 'o campo 9'),
      valor_total_comercializado_feira: parseDecimalRequired(body?.valor_total_comercializado_feira, 'o campo 10')
    };

    await simRepository.upsertTipoFeiraByCodigoIbgeAnoTipo(codigoIbge, anoRef, tipo, payload);

    const tipoRegistro = await simRepository.getTipoFeiraByCodigoIbgeAnoTipo(codigoIbge, anoRef, tipo);
    return { municipio, ano: anoRef, tipo_feira: tipo, dados: tipoRegistro };
  }
}

module.exports = new SimService();
