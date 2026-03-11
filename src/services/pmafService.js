const fs = require('fs');
const path = require('path');
const { isAdminEstado, canAccessPmaf } = require('../utils/roles');
const municipioRepository = require('../repositories/municipioRepository');
const pmafRepository = require('../repositories/pmafRepository');

const UPLOADS_BASE_DIR = path.resolve(__dirname, '../../uploads/pmaf');

const ensureUploadsDir = async () => {
  if (!fs.existsSync(UPLOADS_BASE_DIR)) {
    fs.mkdirSync(UPLOADS_BASE_DIR, { recursive: true });
  }
};

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

const parseIntOrNull = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const num = Number.parseInt(String(value), 10);
  return Number.isFinite(num) ? num : null;
};

const safeUnlink = async (absolutePath) => {
  try {
    await fs.promises.unlink(absolutePath);
  } catch {
    return;
  }
};

class PmafService {
  async ensureReady() {
    await pmafRepository.ensureSchema();
    await ensureUploadsDir();
  }

  resolveCodigoIbge({ user, tenantId, codigoIbgeParam }) {
    const admin = isAdminEstado(user?.perfil);
    if (admin) {
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

  async obterInfo({ user, tenantId, codigoIbgeParam }) {
    await this.ensureReady();
    const codigoIbge = this.resolveCodigoIbge({ user, tenantId, codigoIbgeParam });
    const municipio = await municipioRepository.findByCodigoIbge(codigoIbge);
    const dados = await pmafRepository.findByCodigoIbge(codigoIbge);

    const payload = dados
      ? {
          ...dados,
          documento_url: dados.documento_path ? `/uploads/pmaf/${dados.documento_path}` : null
        }
      : null;

    return { municipio, dados: payload };
  }

  async listar({ user }) {
    await this.ensureReady();
    if (!isAdminEstado(user?.perfil)) {
      throw new Error('Acesso negado.');
    }
    const rows = await pmafRepository.listAll();
    return rows.map((row) => ({
      ...row,
      documento_url: row.documento_path ? `/uploads/pmaf/${row.documento_path}` : null
    }));
  }

  async salvarInfo({ user, tenantId, codigoIbgeParam, body, file }) {
    await this.ensureReady();
    if (!canAccessPmaf(user?.perfil)) {
      throw new Error('Acesso negado.');
    }

    const codigoIbge = this.resolveCodigoIbge({ user, tenantId, codigoIbgeParam });
    const municipio = await municipioRepository.findByCodigoIbge(codigoIbge);
    const atual = await pmafRepository.findByCodigoIbge(codigoIbge);

    const possuiPolitica = parseBoolean(body?.possui_politica);
    if (possuiPolitica === null) {
      throw new Error('Informe se o município possui Política Municipal de Agricultura Familiar e/ou Indígena.');
    }

    let tipoInstrumento = parseIntOrNull(body?.tipo_instrumento);
    let tipoInstrumentoOutro = (body?.tipo_instrumento_outro || '').trim() || null;
    let numeroPublicacao = parseIntOrNull(body?.numero_publicacao);
    let dataPublicacao = body?.data_publicacao ? String(body.data_publicacao).slice(0, 10) : null;

    let documentoPath = atual?.documento_path || null;
    let documentoNomeOriginal = atual?.documento_nome_original || null;

    if (!possuiPolitica) {
      tipoInstrumento = null;
      tipoInstrumentoOutro = null;
      numeroPublicacao = null;
      dataPublicacao = null;

      if (documentoPath) {
        await safeUnlink(path.resolve(UPLOADS_BASE_DIR, documentoPath));
      }
      documentoPath = null;
      documentoNomeOriginal = null;

      if (file) {
        await safeUnlink(file.path);
      }
    } else {
      if (!tipoInstrumento) {
        throw new Error('Informe o tipo do instrumento/dispositivo legal.');
      }
      if (tipoInstrumento === 5 && !tipoInstrumentoOutro) {
        throw new Error('Descreva o tipo do instrumento (Outro).');
      }
      if (!numeroPublicacao) {
        throw new Error('Informe o número da publicação do instrumento legal.');
      }
      if (!dataPublicacao) {
        throw new Error('Informe a data de publicação do instrumento legal.');
      }

      if (file) {
        if (documentoPath) {
          await safeUnlink(path.resolve(UPLOADS_BASE_DIR, documentoPath));
        }
        documentoPath = path.basename(file.filename);
        documentoNomeOriginal = file.originalname || documentoNomeOriginal;
      }

      if (!documentoPath) {
        throw new Error('Anexe o documento do instrumento legal.');
      }

      if (tipoInstrumento !== 5) {
        tipoInstrumentoOutro = null;
      }
    }

    await pmafRepository.upsertByCodigoIbge(codigoIbge, {
      possui_politica: possuiPolitica,
      tipo_instrumento: tipoInstrumento,
      tipo_instrumento_outro: tipoInstrumentoOutro,
      numero_publicacao: numeroPublicacao,
      data_publicacao: dataPublicacao,
      documento_path: documentoPath,
      documento_nome_original: documentoNomeOriginal
    });

    const dados = await pmafRepository.findByCodigoIbge(codigoIbge);
    const payload = dados
      ? {
          ...dados,
          documento_url: dados.documento_path ? `/uploads/pmaf/${dados.documento_path}` : null
        }
      : null;

    return { municipio, dados: payload };
  }

  async removerInfo({ user, tenantId, codigoIbgeParam }) {
    await this.ensureReady();
    if (!canAccessPmaf(user?.perfil)) {
      throw new Error('Acesso negado.');
    }

    const codigoIbge = this.resolveCodigoIbge({ user, tenantId, codigoIbgeParam });
    const atual = await pmafRepository.findByCodigoIbge(codigoIbge);

    if (atual?.documento_path) {
      await safeUnlink(path.resolve(UPLOADS_BASE_DIR, atual.documento_path));
    }

    return pmafRepository.deleteByCodigoIbge(codigoIbge);
  }
}

module.exports = new PmafService();
