import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import simService from '../../services/simService';

const currentYear = () => new Date().getFullYear();

const onlyDigits = (value) => String(value || '').replace(/[^\d]/g, '');

const parseMoneyInput = (value) => {
  const raw = String(value ?? '');
  const cleaned = raw.replace(/[^\d,.-]/g, '');
  return cleaned;
};

const emptyInfo = {
  possui_sim: null,
  possui_medico_veterinario: null,
  aderiu_susaf: null,
  interesse_aderir_susaf: null
};

const emptyFeiras = (ano) => ({
  ano,
  qtd_agricultores_comercializam: '',
  valor_comercializado_anual: '',
  qtd_feiras_permanentes: '',
  qtd_feiras_nao_permanentes: ''
});

const emptyTipo = () => ({
  qtd_comerciantes_produtores_af: '',
  qtd_mulheres_comerciantes_produtoras_af: '',
  qtd_comerciantes_af_revendedores: '',
  qtd_mulheres_comerciantes_revendedoras_af: '',
  qtd_comerciantes_artesanato: '',
  qtd_mulheres_comerciantes_artesanato: '',
  qtd_comerciantes_produtos_industrializados_externos: '',
  valor_comercializado_anual: '',
  valor_total_comercializado_af: '',
  valor_total_comercializado_feira: ''
});

const resolveErrorMessage = (error, fallback) => {
  const apiMessage = error?.response?.data?.message;
  if (apiMessage) return apiMessage;
  if (typeof error?.response?.data === 'string' && error.response.data.trim()) return error.response.data;
  return error?.message || fallback;
};

export default function SimHome() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('sim');
  const [ano, setAno] = useState(currentYear());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [municipio, setMunicipio] = useState(null);

  const [info, setInfo] = useState(emptyInfo);
  const [feiras, setFeiras] = useState(emptyFeiras(currentYear()));
  const [tipoPermanente, setTipoPermanente] = useState(emptyTipo());
  const [tipoNaoPermanente, setTipoNaoPermanente] = useState(emptyTipo());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await simService.obterTudo(ano);
      setMunicipio(result?.municipio || null);

      const nextInfo = result?.info
        ? {
            possui_sim: Boolean(result.info.possui_sim),
            possui_medico_veterinario: Boolean(result.info.possui_medico_veterinario),
            aderiu_susaf: Boolean(result.info.aderiu_susaf),
            interesse_aderir_susaf: Boolean(result.info.interesse_aderir_susaf)
          }
        : emptyInfo;
      setInfo(nextInfo);

      const nextFeiras = result?.feiras
        ? {
            ano: result.feiras.ano,
            qtd_agricultores_comercializam: String(result.feiras.qtd_agricultores_comercializam ?? ''),
            valor_comercializado_anual: String(result.feiras.valor_comercializado_anual ?? ''),
            qtd_feiras_permanentes: String(result.feiras.qtd_feiras_permanentes ?? ''),
            qtd_feiras_nao_permanentes: String(result.feiras.qtd_feiras_nao_permanentes ?? '')
          }
        : emptyFeiras(ano);
      setFeiras(nextFeiras);

      const tipos = Array.isArray(result?.tiposFeiras) ? result.tiposFeiras : [];
      const permanente = tipos.find((t) => Number(t.tipo_feira) === 1);
      const naoPermanente = tipos.find((t) => Number(t.tipo_feira) === 2);

      setTipoPermanente((prev) => ({
        ...prev,
        ...(permanente
          ? {
              qtd_comerciantes_produtores_af: String(permanente.qtd_comerciantes_produtores_af ?? ''),
              qtd_mulheres_comerciantes_produtoras_af: String(permanente.qtd_mulheres_comerciantes_produtoras_af ?? ''),
              qtd_comerciantes_af_revendedores: String(permanente.qtd_comerciantes_af_revendedores ?? ''),
              qtd_mulheres_comerciantes_revendedoras_af: String(permanente.qtd_mulheres_comerciantes_revendedoras_af ?? ''),
              qtd_comerciantes_artesanato: String(permanente.qtd_comerciantes_artesanato ?? ''),
              qtd_mulheres_comerciantes_artesanato: String(permanente.qtd_mulheres_comerciantes_artesanato ?? ''),
              qtd_comerciantes_produtos_industrializados_externos: String(permanente.qtd_comerciantes_produtos_industrializados_externos ?? ''),
              valor_comercializado_anual: String(permanente.valor_comercializado_anual ?? ''),
              valor_total_comercializado_af: String(permanente.valor_total_comercializado_af ?? ''),
              valor_total_comercializado_feira: String(permanente.valor_total_comercializado_feira ?? '')
            }
          : emptyTipo())
      }));

      setTipoNaoPermanente((prev) => ({
        ...prev,
        ...(naoPermanente
          ? {
              qtd_comerciantes_produtores_af: String(naoPermanente.qtd_comerciantes_produtores_af ?? ''),
              qtd_mulheres_comerciantes_produtoras_af: String(naoPermanente.qtd_mulheres_comerciantes_produtoras_af ?? ''),
              qtd_comerciantes_af_revendedores: String(naoPermanente.qtd_comerciantes_af_revendedores ?? ''),
              qtd_mulheres_comerciantes_revendedoras_af: String(naoPermanente.qtd_mulheres_comerciantes_revendedoras_af ?? ''),
              qtd_comerciantes_artesanato: String(naoPermanente.qtd_comerciantes_artesanato ?? ''),
              qtd_mulheres_comerciantes_artesanato: String(naoPermanente.qtd_mulheres_comerciantes_artesanato ?? ''),
              qtd_comerciantes_produtos_industrializados_externos: String(naoPermanente.qtd_comerciantes_produtos_industrializados_externos ?? ''),
              valor_comercializado_anual: String(naoPermanente.valor_comercializado_anual ?? ''),
              valor_total_comercializado_af: String(naoPermanente.valor_total_comercializado_af ?? ''),
              valor_total_comercializado_feira: String(naoPermanente.valor_total_comercializado_feira ?? '')
            }
          : emptyTipo())
      }));
    } catch (error) {
      alert(resolveErrorMessage(error, 'Não foi possível carregar os dados do SIM.'));
    } finally {
      setLoading(false);
    }
  }, [ano]);

  useEffect(() => {
    load();
  }, [load]);

  const permanenteEnabled = useMemo(() => Number(feiras.qtd_feiras_permanentes || 0) > 0, [feiras.qtd_feiras_permanentes]);
  const naoPermanenteEnabled = useMemo(() => Number(feiras.qtd_feiras_nao_permanentes || 0) > 0, [feiras.qtd_feiras_nao_permanentes]);

  const isBlank = (value) => String(value ?? '').trim().length === 0;

  const validateTipo = (label, state) => {
    if (isBlank(state.qtd_comerciantes_produtores_af)) return `Preencha (Tipos de Feiras · ${label}) o campo 1.`;
    if (isBlank(state.qtd_mulheres_comerciantes_produtoras_af)) return `Preencha (Tipos de Feiras · ${label}) o campo 2.`;
    if (isBlank(state.qtd_comerciantes_af_revendedores)) return `Preencha (Tipos de Feiras · ${label}) o campo 3.`;
    if (isBlank(state.qtd_mulheres_comerciantes_revendedoras_af)) return `Preencha (Tipos de Feiras · ${label}) o campo 4.`;
    if (isBlank(state.qtd_comerciantes_artesanato)) return `Preencha (Tipos de Feiras · ${label}) o campo 5.`;
    if (isBlank(state.qtd_mulheres_comerciantes_artesanato)) return `Preencha (Tipos de Feiras · ${label}) o campo 6.`;
    if (isBlank(state.qtd_comerciantes_produtos_industrializados_externos)) return `Preencha (Tipos de Feiras · ${label}) o campo 7.`;
    if (isBlank(state.valor_comercializado_anual)) return `Preencha (Tipos de Feiras · ${label}) o campo 8.`;
    if (isBlank(state.valor_total_comercializado_af)) return `Preencha (Tipos de Feiras · ${label}) o campo 9.`;
    if (isBlank(state.valor_total_comercializado_feira)) return `Preencha (Tipos de Feiras · ${label}) o campo 10.`;
    return null;
  };

  const validateAll = () => {
    if (info.possui_sim === null) return 'Informe se o município possui SIM implantado.';
    if (info.possui_medico_veterinario === null) return 'Informe se o município possui médico veterinário exclusivo disponível para atender o SIM.';
    if (info.aderiu_susaf === null) return 'Informe se o município fez adesão ao SUSAF/MT.';
    if (info.interesse_aderir_susaf === null) return 'Informe se o município tem interesse em aderir ao SUSAF/MT.';

    if (isBlank(feiras.qtd_agricultores_comercializam)) return 'Informe a quantidade de agricultores e agricultoras familiares que comercializam nas feiras livres.';
    if (isBlank(feiras.valor_comercializado_anual)) return 'Informe o valor comercializado (R$) nas feiras livres anualmente.';
    if (isBlank(feiras.qtd_feiras_permanentes)) return 'Informe a quantidade de feiras permanentes regulares.';
    if (isBlank(feiras.qtd_feiras_nao_permanentes)) return 'Informe a quantidade de feiras NÃO permanentes regulares.';

    if (permanenteEnabled) {
      const msg = validateTipo('Feiras Permanentes', tipoPermanente);
      if (msg) return msg;
    }

    if (naoPermanenteEnabled) {
      const msg = validateTipo('Feiras Não Permanentes', tipoNaoPermanente);
      if (msg) return msg;
    }

    return null;
  };

  const saveAll = async () => {
    const validationMessage = validateAll();
    if (validationMessage) {
      alert(validationMessage);
      return;
    }

    setSaving(true);
    try {
      await simService.salvarInfo(info);
      await simService.salvarFeiras(ano, {
        qtd_agricultores_comercializam: feiras.qtd_agricultores_comercializam,
        valor_comercializado_anual: feiras.valor_comercializado_anual,
        qtd_feiras_permanentes: feiras.qtd_feiras_permanentes,
        qtd_feiras_nao_permanentes: feiras.qtd_feiras_nao_permanentes
      });

      if (permanenteEnabled) {
        await simService.salvarTipoFeira(ano, 1, tipoPermanente);
      }

      if (naoPermanenteEnabled) {
        await simService.salvarTipoFeira(ano, 2, tipoNaoPermanente);
      }

      alert('Dados salvos com sucesso.');
      await load();
    } catch (error) {
      alert(resolveErrorMessage(error, 'Não foi possível salvar os dados do SIM.'));
    } finally {
      setSaving(false);
    }
  };

  const renderBoolean = (value, onChange, name) => (
    <div className="flex items-center gap-6">
      <label className="inline-flex items-center gap-2 text-sm text-slate-700">
        <input
          type="radio"
          name={name}
          checked={value === true}
          onChange={() => onChange(true)}
          className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
        />
        Sim
      </label>
      <label className="inline-flex items-center gap-2 text-sm text-slate-700">
        <input
          type="radio"
          name={name}
          checked={value === false}
          onChange={() => onChange(false)}
          className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
        />
        Não
      </label>
    </div>
  );

  const renderTipoForm = (state, setState, disabled = false) => {
    const inputClassName = 'w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed';

    return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">1 - Quantos são comerciantes e produtores da Agricultura Familiar?</label>
          <input
            disabled={disabled}
            value={state.qtd_comerciantes_produtores_af}
            onChange={(e) => setState((prev) => ({ ...prev, qtd_comerciantes_produtores_af: onlyDigits(e.target.value) }))}
            className={inputClassName}
            inputMode="numeric"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">2 - Quantas mulheres são comerciantes e produtoras da Agricultura Familiar?</label>
          <input
            disabled={disabled}
            value={state.qtd_mulheres_comerciantes_produtoras_af}
            onChange={(e) => setState((prev) => ({ ...prev, qtd_mulheres_comerciantes_produtoras_af: onlyDigits(e.target.value) }))}
            className={inputClassName}
            inputMode="numeric"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">3 - Quantos são comerciantes da Agricultura Familiar (Revendedores)?</label>
          <input
            disabled={disabled}
            value={state.qtd_comerciantes_af_revendedores}
            onChange={(e) => setState((prev) => ({ ...prev, qtd_comerciantes_af_revendedores: onlyDigits(e.target.value) }))}
            className={inputClassName}
            inputMode="numeric"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">4 - Quantas mulheres são comerciantes (revendedoras) da Agricultura Familiar?</label>
          <input
            disabled={disabled}
            value={state.qtd_mulheres_comerciantes_revendedoras_af}
            onChange={(e) => setState((prev) => ({ ...prev, qtd_mulheres_comerciantes_revendedoras_af: onlyDigits(e.target.value) }))}
            className={inputClassName}
            inputMode="numeric"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">5 - Quantos são comerciantes de artesanato?</label>
          <input
            disabled={disabled}
            value={state.qtd_comerciantes_artesanato}
            onChange={(e) => setState((prev) => ({ ...prev, qtd_comerciantes_artesanato: onlyDigits(e.target.value) }))}
            className={inputClassName}
            inputMode="numeric"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">6 - Quantas mulheres são comerciantes de artesanato?</label>
          <input
            disabled={disabled}
            value={state.qtd_mulheres_comerciantes_artesanato}
            onChange={(e) => setState((prev) => ({ ...prev, qtd_mulheres_comerciantes_artesanato: onlyDigits(e.target.value) }))}
            className={inputClassName}
            inputMode="numeric"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">7 - Quantos são comerciantes de produtos industrializados de origem externa?</label>
          <input
            disabled={disabled}
            value={state.qtd_comerciantes_produtos_industrializados_externos}
            onChange={(e) => setState((prev) => ({ ...prev, qtd_comerciantes_produtos_industrializados_externos: onlyDigits(e.target.value) }))}
            className={inputClassName}
            inputMode="numeric"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">08 - Qual o valor comercializado (R$) nas feiras do município anualmente?</label>
          <input
            disabled={disabled}
            value={state.valor_comercializado_anual}
            onChange={(e) => setState((prev) => ({ ...prev, valor_comercializado_anual: parseMoneyInput(e.target.value) }))}
            className={inputClassName}
            inputMode="decimal"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">9 - Qual o valor total comercializado pela Agricultura Familiar?</label>
          <input
            disabled={disabled}
            value={state.valor_total_comercializado_af}
            onChange={(e) => setState((prev) => ({ ...prev, valor_total_comercializado_af: parseMoneyInput(e.target.value) }))}
            className={inputClassName}
            inputMode="decimal"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">10 - Qual o valor total comercializado na feira?</label>
          <input
            disabled={disabled}
            value={state.valor_total_comercializado_feira}
            onChange={(e) => setState((prev) => ({ ...prev, valor_total_comercializado_feira: parseMoneyInput(e.target.value) }))}
            className={inputClassName}
            inputMode="decimal"
          />
        </div>
      </div>
    </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center text-gray-500">
        Carregando SIM...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">SIM</h1>
          <p className="text-sm text-gray-500">
            {municipio ? `${municipio.nome} · IBGE ${municipio.codigo_ibge}` : 'Serviço de Inspeção Municipal'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-slate-700">Ano</label>
          <input
            type="number"
            value={ano}
            onChange={(e) => setAno(Number(onlyDigits(e.target.value).slice(0, 4) || currentYear()))}
            className="w-28 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            min={2000}
            max={2100}
          />
          <button
            type="button"
            disabled={saving}
            onClick={saveAll}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <button
            type="button"
            onClick={() => setTab('sim')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === 'sim' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-200'}`}
          >
            SIM
          </button>
          <button
            type="button"
            onClick={() => setTab('feiras')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === 'feiras' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-200'}`}
          >
            Feiras
          </button>
          <button
            type="button"
            onClick={() => setTab('tipos')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === 'tipos' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-200'}`}
          >
            Tipos de Feiras
          </button>
        </div>

        <div className="p-6">
          {tab === 'sim' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  O município possui Serviço de Inspeção Municipal - SIM implantado?
                </label>
                {renderBoolean(info.possui_sim, (v) => setInfo((prev) => ({ ...prev, possui_sim: v })), 'possui_sim')}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  O município possui médico veterinário exclusivo disponível para atender o SIM?
                </label>
                {renderBoolean(info.possui_medico_veterinario, (v) => setInfo((prev) => ({ ...prev, possui_medico_veterinario: v })), 'possui_medico_veterinario')}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  O município fez adesão ao Sistema Unificado Estadual de Sanidade Agroindustrial Familiar de Pequeno Porte - SUSAF/MT?
                </label>
                <p className="text-xs text-slate-500">
                  Para informações sobre o SUSAF/MT, vide Decreto nº 10.502, de 18/01/2017 e Decreto nº 218, de 21/08/2019, e o portal:
                  {' '}
                  <a className="text-blue-600 hover:text-blue-800" href="http://www.agriculturafamiliar.mt.gov.br" target="_blank" rel="noreferrer">
                    http://www.agriculturafamiliar.mt.gov.br
                  </a>
                </p>
                {renderBoolean(info.aderiu_susaf, (v) => setInfo((prev) => ({ ...prev, aderiu_susaf: v })), 'aderiu_susaf')}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  O município tem interesse em aderir ao SUSAF/MT?
                </label>
                {renderBoolean(info.interesse_aderir_susaf, (v) => setInfo((prev) => ({ ...prev, interesse_aderir_susaf: v })), 'interesse_aderir_susaf')}
              </div>
            </div>
          )}

          {tab === 'feiras' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Ano referência do questionário</label>
                  <input
                    value={ano}
                    disabled
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Quantas agricultoras e agricultores familiares do município comercializam nas feiras livres?
                  </label>
                  <input
                    value={feiras.qtd_agricultores_comercializam}
                    onChange={(e) => setFeiras((prev) => ({ ...prev, qtd_agricultores_comercializam: onlyDigits(e.target.value) }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    inputMode="numeric"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Qual o valor comercializado (R$) nas feiras livres do município anualmente?
                  </label>
                  <input
                    value={feiras.valor_comercializado_anual}
                    onChange={(e) => setFeiras((prev) => ({ ...prev, valor_comercializado_anual: parseMoneyInput(e.target.value) }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    inputMode="decimal"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Quantas feiras permanentes regulares existem no município?
                  </label>
                  <input
                    value={feiras.qtd_feiras_permanentes}
                    onChange={(e) => setFeiras((prev) => ({ ...prev, qtd_feiras_permanentes: onlyDigits(e.target.value) }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    inputMode="numeric"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Quantas feiras NÃO permanentes regulares existem no município?
                  </label>
                  <input
                    value={feiras.qtd_feiras_nao_permanentes}
                    onChange={(e) => setFeiras((prev) => ({ ...prev, qtd_feiras_nao_permanentes: onlyDigits(e.target.value) }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    inputMode="numeric"
                  />
                </div>
              </div>
            </div>
          )}

          {tab === 'tipos' && (
            <div className="space-y-8">
              {!permanenteEnabled && !naoPermanenteEnabled && (
                <div className="text-sm text-slate-600">
                  Informe as quantidades de feiras permanentes e/ou não permanentes na aba “Feiras” para habilitar os campos desta seção.
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-800">Feiras Permanentes</h3>
                {!permanenteEnabled && (
                  <div className="text-xs text-slate-500">
                    Configure “Quantidade de feiras permanentes” na aba “Feiras” para habilitar.
                  </div>
                )}
                {renderTipoForm(tipoPermanente, setTipoPermanente, !permanenteEnabled)}
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-800">Feiras Não Permanentes</h3>
                {!naoPermanenteEnabled && (
                  <div className="text-xs text-slate-500">
                    Configure “Quantidade de feiras NÃO permanentes” na aba “Feiras” para habilitar.
                  </div>
                )}
                {renderTipoForm(tipoNaoPermanente, setTipoNaoPermanente, !naoPermanenteEnabled)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
