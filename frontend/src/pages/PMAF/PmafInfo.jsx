import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, FileText, Loader2, Save } from 'lucide-react';
import pmafService from '../../services/pmafService';
import api from '../../services/api';
import { isAdminEstado } from '../../utils/roles';
import { useAuth } from '../../contexts/useAuth';

const resolveFileUrl = (relativeUrl) => {
  if (!relativeUrl) return null;
  if (/^https?:\/\//i.test(relativeUrl)) return relativeUrl;
  if (import.meta.env.PROD) return relativeUrl;

  const baseURL = api?.defaults?.baseURL || '';
  const origin = baseURL.replace(/\/api\/?$/i, '');
  if (!origin) return relativeUrl;
  return `${origin}${relativeUrl.startsWith('/') ? '' : '/'}${relativeUrl}`;
};

const TIPO_INSTRUMENTO_OPTIONS = [
  { value: 1, label: 'Lei' },
  { value: 2, label: 'Decreto' },
  { value: 3, label: 'Portaria' },
  { value: 4, label: 'Resolução' },
  { value: 5, label: 'Outro' }
];

export default function PmafInfo() {
  const navigate = useNavigate();
  const { codigoIbge: codigoIbgeParam } = useParams();
  const { user } = useAuth();
  const admin = isAdminEstado(user?.perfil);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [municipio, setMunicipio] = useState(null);

  const [possuiPolitica, setPossuiPolitica] = useState(null);
  const [tipoInstrumento, setTipoInstrumento] = useState('');
  const [tipoInstrumentoOutro, setTipoInstrumentoOutro] = useState('');
  const [numeroPublicacao, setNumeroPublicacao] = useState('');
  const [dataPublicacao, setDataPublicacao] = useState('');
  const [documentoAtualUrl, setDocumentoAtualUrl] = useState(null);
  const [documentoAtualNome, setDocumentoAtualNome] = useState('');
  const [novoDocumento, setNovoDocumento] = useState(null);

  const codigoIbge = admin ? codigoIbgeParam : null;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await pmafService.obterInfo(codigoIbge);
      setMunicipio(result?.municipio || null);

      const dados = result?.dados;
      if (!dados) {
        setPossuiPolitica(null);
        setTipoInstrumento('');
        setTipoInstrumentoOutro('');
        setNumeroPublicacao('');
        setDataPublicacao('');
        setDocumentoAtualUrl(null);
        setDocumentoAtualNome('');
        setNovoDocumento(null);
        return;
      }

      setPossuiPolitica(Boolean(dados.possui_politica));
      setTipoInstrumento(dados.tipo_instrumento ? String(dados.tipo_instrumento) : '');
      setTipoInstrumentoOutro(dados.tipo_instrumento_outro || '');
      setNumeroPublicacao(dados.numero_publicacao ? String(dados.numero_publicacao) : '');
      setDataPublicacao(dados.data_publicacao ? String(dados.data_publicacao).slice(0, 10) : '');
      setDocumentoAtualUrl(resolveFileUrl(dados.documento_url));
      setDocumentoAtualNome(dados.documento_nome_original || '');
      setNovoDocumento(null);
    } catch (error) {
      alert(error?.response?.data?.message || 'Não foi possível carregar as informações do PMAF.');
    } finally {
      setLoading(false);
    }
  }, [codigoIbge]);

  useEffect(() => {
    load();
  }, [load]);

  const isOutro = useMemo(() => String(tipoInstrumento) === '5', [tipoInstrumento]);

  const handleChangePossuiPolitica = (value) => {
    if (value === false && possuiPolitica === true) {
      const ok = confirm(
        'Ao alterar de "Sim" para "Não", os dados do instrumento e o documento anexado serão descartados após salvar. Deseja continuar?'
      );
      if (!ok) return;
    }

    setPossuiPolitica(value);
    setNovoDocumento(null);
    if (!value) {
      setTipoInstrumento('');
      setTipoInstrumentoOutro('');
      setNumeroPublicacao('');
      setDataPublicacao('');
      setDocumentoAtualUrl(null);
      setDocumentoAtualNome('');
    }
  };

  const validate = () => {
    if (possuiPolitica === null) {
      return 'Informe se o município possui Política Municipal de Agricultura Familiar e/ou Indígena.';
    }

    if (!possuiPolitica) {
      return null;
    }

    if (!tipoInstrumento) {
      return 'Informe o tipo do instrumento/dispositivo legal.';
    }
    if (String(tipoInstrumento) === '5' && !tipoInstrumentoOutro.trim()) {
      return 'Descreva o tipo do instrumento (Outro).';
    }
    if (!numeroPublicacao.trim()) {
      return 'Informe o número da publicação do instrumento legal.';
    }
    if (!dataPublicacao) {
      return 'Informe a data de publicação do instrumento legal.';
    }
    if (!novoDocumento && !documentoAtualUrl) {
      return 'Anexe o documento do instrumento legal.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      alert(error);
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('possui_politica', possuiPolitica ? 'true' : 'false');
      formData.append('tipo_instrumento', tipoInstrumento || '');
      formData.append('tipo_instrumento_outro', tipoInstrumentoOutro || '');
      formData.append('numero_publicacao', numeroPublicacao || '');
      formData.append('data_publicacao', dataPublicacao || '');
      if (novoDocumento) {
        formData.append('documento', novoDocumento);
      }

      await pmafService.salvarInfo(codigoIbge, formData);
      await load();
      alert('PMAF salvo com sucesso.');
    } catch (error) {
      alert(error?.response?.data?.message || 'Não foi possível salvar o PMAF.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const ok = confirm('Remover as informações do PMAF deste município?');
    if (!ok) return;

    setSaving(true);
    try {
      await pmafService.removerInfo(codigoIbge);
      await load();
      alert('PMAF removido com sucesso.');
    } catch (error) {
      alert(error?.response?.data?.message || 'Não foi possível remover o PMAF.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-center text-gray-500">
        Carregando PMAF...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            {admin && (
              <button
                type="button"
                onClick={() => navigate('/pmaf')}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
            )}
            <h1 className="text-2xl font-bold text-gray-800">PMAF</h1>
          </div>
          <p className="text-sm text-gray-500">
            {municipio?.nome ? `Município: ${municipio.nome} (${municipio.codigo_ibge})` : 'Política Municipal de Agricultura Familiar e/ou Indígena'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Informações sobre o PMAF</h2>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              O município possui Política Municipal de Agricultura Familiar e/ou Indígena?
            </label>
            <div className="flex items-center gap-6">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="possuiPolitica"
                  checked={possuiPolitica === true}
                  onChange={() => handleChangePossuiPolitica(true)}
                  className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                Sim
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="possuiPolitica"
                  checked={possuiPolitica === false}
                  onChange={() => handleChangePossuiPolitica(false)}
                  className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                Não
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Qual o tipo do instrumento/dispositivo legal?
              </label>
              <select
                value={tipoInstrumento}
                onChange={(e) => setTipoInstrumento(e.target.value)}
                disabled={possuiPolitica !== true}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">Selecione</option>
                {TIPO_INSTRUMENTO_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {isOutro && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Descreva (Outro)</label>
                <input
                  value={tipoInstrumentoOutro}
                  onChange={(e) => setTipoInstrumentoOutro(e.target.value)}
                  disabled={possuiPolitica !== true}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Número da publicação do instrumento legal que instituiu a política
              </label>
              <input
                value={numeroPublicacao}
                onChange={(e) => setNumeroPublicacao(e.target.value.replace(/[^\d]/g, ''))}
                disabled={possuiPolitica !== true}
                inputMode="numeric"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Data de publicação do instrumento legal que instituiu a política
              </label>
              <input
                type="date"
                value={dataPublicacao}
                onChange={(e) => setDataPublicacao(e.target.value)}
                disabled={possuiPolitica !== true}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Upload documento</label>
            {documentoAtualUrl && (
              <div className="flex items-center justify-between gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span className="font-medium">{documentoAtualNome || 'Documento anexado'}</span>
                </div>
                <a
                  href={documentoAtualUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  Abrir
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
            <input
              type="file"
              accept="application/pdf,image/png,image/jpeg,image/webp"
              disabled={possuiPolitica !== true}
              onChange={(e) => setNovoDocumento(e.target.files?.[0] || null)}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
            />
            {novoDocumento && (
              <p className="text-xs text-slate-500">Novo arquivo selecionado: {novoDocumento.name}</p>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="px-4 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-60"
          >
            Remover
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}
