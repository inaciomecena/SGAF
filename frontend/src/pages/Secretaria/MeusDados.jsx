import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Loader2, Save } from 'lucide-react';
import municipioService from '../../services/municipioService';

const SERVICOS_OPTIONS = [
  'Assistência/Orientação Técnica',
  'Assistência Técnica e Extensão Rural - ATER',
  'Disponibilização de horas-trator/máquina (com custo)',
  'Disponibilização de horas-trator/máquina (gratuitamente)',
  'Disponibilização de insumos (calcário, fertilizantes, sementes, mudas etc.)',
  'Apoio à elaboração de projetos de crédito rural',
  'Realização de dias de campo, excursões, cursos, capacitações, seminários e demonstrações técnicas',
  'Programa/projeto/ação voltada ao associativismo e cooperativismo',
  'Programa/projeto/ação voltada ao acesso à água para consumo',
  'Programa/projeto/ação voltada à irrigação',
  'Programa/projeto/ação voltada à cadeia produtiva da apicultura',
  'Programa/projeto/ação voltada à cadeia produtiva da avicultura',
  'Programa/projeto/ação voltada à cadeia produtiva do arroz na agricultura familiar',
  'Programa/projeto/ação voltada à cadeia produtiva da cacauicultura',
  'Programa/projeto/ação voltada à cadeia produtiva da cafeicultura',
  'Programa/projeto/ação voltada à cadeia produtiva da floricultura',
  'Programa/projeto/ação voltada à cadeia produtiva da fruticultura',
  'Programa/projeto/ação voltada à cadeia produtiva da mandioca',
  'Programa/projeto/ação voltada à cadeia produtiva da olericultura',
  'Programa/projeto/ação voltada à cadeia produtiva da pecuária do leite',
  'Programa/projeto/ação voltada à cadeia produtiva da pecuária de corte',
  'Programa/projeto/ação voltada à cadeia produtiva da piscicultura',
  'Programa/projeto/ação voltada à cadeia produtiva de Sistemas Agroflorestais (SAFs)',
  'Programa/projeto/ação voltada à cadeia produtiva de plantas medicinais, aromáticas e condimentares',
  'Programa/projeto/ação voltada à produção agroecológica',
  'Programa/projeto/ação voltada à produção orgânica',
  'Serviço de Inspeção Municipal - SIM',
  'Apoio à realização de feiras',
  'Apoio à elaboração de projetos para o Programa Nacional de Alimentação Escolar - PNAE',
  'Apoio à elaboração de propostas para o Programa de Aquisição de Alimentos - PAA',
  'Programa municipal de aquisição de alimentos',
  'Programa municipal de compras governamentais',
  'Programa/projeto/ação voltada à comercialização dos produtos da agricultura familiar em canais convencionais',
  'Programa/projeto/ação voltada à comercialização eletrônica dos produtos da agricultura familiar',
  'Cadastro e apoio na emissão de nota fiscal',
  'Emissão de declaração de produção e localização de estabelecimento agropecuário para benefício da reforma agrária',
  'Programa/projeto/ação específica para a juventude rural',
  'Programa/projeto/ação específica para as mulheres rurais',
  'Programa/projeto/ação específica para os indígenas',
  'Programa/projeto/ação específica para os quilombolas',
  'Programa/projeto/ação específica para outros Povos e Comunidades Tradicionais'
];

const PUBLICACAO_OPTIONS = ['Lei municipal', 'Decreto', 'Portaria', 'Resolução', 'Instrução normativa', 'Outro'];

const emptyForm = {
  nome_secretaria: '',
  endereco: '',
  numero: '',
  bairro: '',
  cep: '',
  email: '',
  telefone: '',
  responsavel_nome: '',
  responsavel_cargo: '',
  responsavel_telefone: '',
  responsavel_email: '',
  qtd_servidores: '',
  qtd_servidores_concursados: '',
  possui_fundo_municipal: true,
  fundo_tipo_publicacao: '',
  fundo_numero_publicacao: '',
  fundo_data_publicacao: '',
  fundo_orcamento_anual: '',
  fundo_percentual_orcamento: '',
  possui_escritorio_empaer: false,
  projetos_com_empaer: false,
  projetos_empaer_texto: '',
  servidor_municipio_cedido_empaer: false,
  servidores_municipio_cedidos: '',
  servidor_empaer_cedido_municipio: false,
  servidores_empaer_cedidos: '',
  possui_escritorio_indea: false,
  possui_unidade_senar: false,
  servicos_prestados: []
};

const onlyDigits = (value) => value.replace(/\D/g, '');

const formatCep = (value) => {
  const raw = onlyDigits(value).slice(0, 8);
  if (raw.length <= 5) return raw;
  return `${raw.slice(0, 5)}-${raw.slice(5)}`;
};

const formatPhone = (value) => {
  const raw = onlyDigits(value).slice(0, 11);
  if (raw.length <= 2) return raw;
  if (raw.length <= 6) return `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
  if (raw.length <= 10) return `(${raw.slice(0, 2)}) ${raw.slice(2, 6)}-${raw.slice(6)}`;
  return `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
};

export default function MeusDados() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepLookupError, setCepLookupError] = useState('');
  const [municipio, setMunicipio] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const concursosInvalidos = useMemo(() => {
    const total = Number(formData.qtd_servidores || 0);
    const concursados = Number(formData.qtd_servidores_concursados || 0);
    return concursados > total;
  }, [formData.qtd_servidores, formData.qtd_servidores_concursados]);

  const loadDados = async () => {
    setLoading(true);
    try {
      const response = await municipioService.obterMeusDados();
      setMunicipio(response.municipio || null);
      const nomeMunicipio = response?.municipio?.nome || '';
      if (response.dados) {
        setFormData({
          ...emptyForm,
          ...response.dados,
          nome_secretaria: response.dados.nome_secretaria || nomeMunicipio,
          numero: response.dados.numero ?? '',
          qtd_servidores: response.dados.qtd_servidores ?? '',
          qtd_servidores_concursados: response.dados.qtd_servidores_concursados ?? '',
          fundo_orcamento_anual: response.dados.fundo_orcamento_anual ?? '',
          fundo_percentual_orcamento: response.dados.fundo_percentual_orcamento ?? '',
          servicos_prestados: Array.isArray(response.dados.servicos_prestados) ? response.dados.servicos_prestados : []
        });
      } else {
        setFormData({
          ...emptyForm,
          nome_secretaria: nomeMunicipio
        });
      }
    } catch (error) {
      alert(error?.response?.data?.message || 'Não foi possível carregar os dados da secretaria.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDados();
  }, []);

  const buscarCepBrasilApi = async (cepValue) => {
    const cepNumerico = onlyDigits(cepValue);
    if (cepNumerico.length !== 8) return;

    setCepLoading(true);
    setCepLookupError('');
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cepNumerico}`);
      if (!response.ok) {
        throw new Error('CEP inválido');
      }

      const data = await response.json();
      setFormData((prev) => ({
        ...prev,
        cep: formatCep(cepNumerico),
        endereco: data?.street || prev.endereco,
        bairro: data?.neighborhood || prev.bairro
      }));
    } catch {
      setCepLookupError('Não foi possível consultar este CEP.');
    } finally {
      setCepLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let nextValue = type === 'checkbox' ? checked : value;

    if (name === 'cep') {
      nextValue = formatCep(value);
      setCepLookupError('');
    }
    if (name === 'telefone' || name === 'responsavel_telefone') nextValue = formatPhone(value);

    setFormData((prev) => {
      const next = { ...prev, [name]: nextValue };
      if (name === 'possui_fundo_municipal' && !nextValue) {
        next.fundo_tipo_publicacao = '';
        next.fundo_numero_publicacao = '';
        next.fundo_data_publicacao = '';
        next.fundo_orcamento_anual = '';
        next.fundo_percentual_orcamento = '';
      }
      if (name === 'projetos_com_empaer' && !nextValue) {
        next.projetos_empaer_texto = '';
      }
      if (name === 'servidor_municipio_cedido_empaer' && !nextValue) {
        next.servidores_municipio_cedidos = '';
      }
      if (name === 'servidor_empaer_cedido_municipio' && !nextValue) {
        next.servidores_empaer_cedidos = '';
      }
      return next;
    });
  };

  const handleToggleServico = (servico) => {
    setFormData((prev) => {
      const existe = prev.servicos_prestados.includes(servico);
      return {
        ...prev,
        servicos_prestados: existe
          ? prev.servicos_prestados.filter((item) => item !== servico)
          : [...prev.servicos_prestados, servico]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (concursosInvalidos) {
      alert('A quantidade de concursados não pode ser maior que o total de servidores.');
      return;
    }

    setSaving(true);
    try {
      await municipioService.salvarMeusDados(formData);
      alert('Meus Dados atualizados com sucesso.');
      await loadDados();
    } catch (error) {
      alert(error?.response?.data?.message || 'Não foi possível salvar os dados da secretaria.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-center text-gray-500">
        Carregando Meus Dados...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Meus Dados</h1>
          <p className="text-sm text-gray-500">
            {municipio ? `${municipio.nome} · IBGE ${municipio.codigo_ibge}` : 'Dados da Secretaria/Órgão Municipal'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { id: 1, label: 'Aba 1', title: 'Informações Gerais' },
              { id: 2, label: 'Aba 2', title: 'Informações Complementares' },
              { id: 3, label: 'Aba 3', title: 'Órgãos Estaduais' },
              { id: 4, label: 'Aba 4', title: 'Serviços Prestados' }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === item.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {tab === 1 && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="text-sm font-semibold tracking-wide text-blue-700 uppercase">Aba 1 · Informações Gerais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700">Nome da Secretaria/Órgão *</label>
                <input
                  type="text"
                  name="nome_secretaria"
                  required
                  value={formData.nome_secretaria}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">CEP *</label>
                <input
                  type="text"
                  name="cep"
                  required
                  value={formData.cep}
                  onChange={handleChange}
                  onBlur={() => buscarCepBrasilApi(formData.cep)}
                  maxLength={9}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="00000-000"
                />
                {cepLoading && <p className="text-xs text-blue-600">Consultando CEP...</p>}
                {cepLookupError && <p className="text-xs text-rose-600">{cepLookupError}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Endereço/Rua/Avenida *</label>
                <input
                  type="text"
                  name="endereco"
                  required
                  value={formData.endereco}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Número</label>
                <input
                  type="number"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Bairro *</label>
                <input
                  type="text"
                  name="bairro"
                  required
                  value={formData.bairro}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">E-mail *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Telefone *</label>
                <input
                  type="text"
                  name="telefone"
                  required
                  value={formData.telefone}
                  onChange={handleChange}
                  maxLength={15}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700">Nome completo do responsável pelo Órgão *</label>
                <input
                  type="text"
                  name="responsavel_nome"
                  required
                  value={formData.responsavel_nome}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Cargo/Função *</label>
                <input
                  type="text"
                  name="responsavel_cargo"
                  required
                  value={formData.responsavel_cargo}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Telefone do responsável *</label>
                <input
                  type="text"
                  name="responsavel_telefone"
                  required
                  value={formData.responsavel_telefone}
                  onChange={handleChange}
                  maxLength={15}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700">E-mail do responsável *</label>
                <input
                  type="email"
                  name="responsavel_email"
                  required
                  value={formData.responsavel_email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </section>
        )}

        {tab === 2 && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="text-sm font-semibold tracking-wide text-blue-700 uppercase">Aba 2 · Informações Complementares</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Total de servidores/servidoras *</label>
                <input
                  type="number"
                  name="qtd_servidores"
                  required
                  min={0}
                  value={formData.qtd_servidores}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Servidores concursados *</label>
                <input
                  type="number"
                  name="qtd_servidores_concursados"
                  required
                  min={0}
                  value={formData.qtd_servidores_concursados}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none ${
                    concursosInvalidos
                      ? 'border-red-300 focus:ring-red-400'
                      : 'border-gray-200 focus:ring-blue-500'
                  }`}
                />
                {concursosInvalidos && (
                  <p className="text-xs text-red-600">Não pode ser maior que o total de servidores.</p>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700">O município possui Fundo Municipal para agricultura familiar? *</label>
                <div className="flex items-center gap-6">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input type="radio" name="possui_fundo_municipal" checked={!!formData.possui_fundo_municipal} onChange={() => setFormData((prev) => ({ ...prev, possui_fundo_municipal: true }))} />
                    Sim
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input type="radio" name="possui_fundo_municipal" checked={!formData.possui_fundo_municipal} onChange={() => setFormData((prev) => ({ ...prev, possui_fundo_municipal: false, fundo_tipo_publicacao: '', fundo_numero_publicacao: '', fundo_data_publicacao: '', fundo_orcamento_anual: '', fundo_percentual_orcamento: '' }))} />
                    Não
                  </label>
                </div>
              </div>

              {formData.possui_fundo_municipal && (
                <>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-700">Tipo da publicação legal *</label>
                    <select
                      name="fundo_tipo_publicacao"
                      required={formData.possui_fundo_municipal}
                      value={formData.fundo_tipo_publicacao}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value="">Selecione...</option>
                      {PUBLICACAO_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Número da publicação *</label>
                    <input
                      type="text"
                      name="fundo_numero_publicacao"
                      required={formData.possui_fundo_municipal}
                      value={formData.fundo_numero_publicacao}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Data da publicação *</label>
                    <input
                      type="date"
                      name="fundo_data_publicacao"
                      required={formData.possui_fundo_municipal}
                      value={formData.fundo_data_publicacao}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Orçamento anual destinado (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      name="fundo_orcamento_anual"
                      required={formData.possui_fundo_municipal}
                      value={formData.fundo_orcamento_anual}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Percentual do orçamento municipal (%) *</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      name="fundo_percentual_orcamento"
                      required={formData.possui_fundo_municipal}
                      value={formData.fundo_percentual_orcamento}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {tab === 3 && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="text-sm font-semibold tracking-wide text-blue-700 uppercase">Aba 3 · Informações sobre Órgãos Estaduais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                ['possui_escritorio_empaer', 'O município possui escritório da Empaer?'],
                ['possui_escritorio_indea', 'O município possui escritório do Indea?'],
                ['possui_unidade_senar', 'O município possui unidade da Senar?']
              ].map(([name, label]) => (
                <div key={name} className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">{label}</label>
                  <select
                    name={name}
                    value={formData[name] ? 'sim' : 'nao'}
                    onChange={(e) => setFormData((prev) => ({ ...prev, [name]: e.target.value === 'sim' }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="sim">Sim</option>
                    <option value="nao">Não</option>
                  </select>
                </div>
              ))}

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700">O município desenvolve projetos junto com a Empaer?</label>
                <select
                  name="projetos_com_empaer"
                  value={formData.projetos_com_empaer ? 'sim' : 'nao'}
                  onChange={(e) => setFormData((prev) => ({ ...prev, projetos_com_empaer: e.target.value === 'sim', projetos_empaer_texto: e.target.value === 'sim' ? prev.projetos_empaer_texto : '' }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
                {formData.projetos_com_empaer && (
                  <textarea
                    rows={3}
                    name="projetos_empaer_texto"
                    value={formData.projetos_empaer_texto}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Liste os projetos desenvolvidos com a Empaer"
                  />
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700">Há servidor do município cedido para a Empaer?</label>
                <select
                  name="servidor_municipio_cedido_empaer"
                  value={formData.servidor_municipio_cedido_empaer ? 'sim' : 'nao'}
                  onChange={(e) => setFormData((prev) => ({ ...prev, servidor_municipio_cedido_empaer: e.target.value === 'sim', servidores_municipio_cedidos: e.target.value === 'sim' ? prev.servidores_municipio_cedidos : '' }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
                {formData.servidor_municipio_cedido_empaer && (
                  <textarea
                    rows={3}
                    name="servidores_municipio_cedidos"
                    value={formData.servidores_municipio_cedidos}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Informe os nomes dos servidores cedidos"
                  />
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700">Há servidor da Empaer cedido para o município?</label>
                <select
                  name="servidor_empaer_cedido_municipio"
                  value={formData.servidor_empaer_cedido_municipio ? 'sim' : 'nao'}
                  onChange={(e) => setFormData((prev) => ({ ...prev, servidor_empaer_cedido_municipio: e.target.value === 'sim', servidores_empaer_cedidos: e.target.value === 'sim' ? prev.servidores_empaer_cedidos : '' }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
                {formData.servidor_empaer_cedido_municipio && (
                  <textarea
                    rows={3}
                    name="servidores_empaer_cedidos"
                    value={formData.servidores_empaer_cedidos}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Informe os nomes dos servidores cedidos"
                  />
                )}
              </div>
            </div>
          </section>
        )}

        {tab === 4 && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="text-sm font-semibold tracking-wide text-blue-700 uppercase">Aba 4 · Serviços Prestados</h2>
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
              Selecione todos os serviços prestados pela Secretaria/Órgão Municipal ao público da agricultura familiar.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SERVICOS_OPTIONS.map((servico) => {
                const checked = formData.servicos_prestados.includes(servico);
                return (
                  <label key={servico} className={`flex items-start gap-3 border rounded-lg p-3 cursor-pointer ${checked ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleServico(servico)}
                      className="mt-1"
                    />
                    <span className="text-sm text-gray-800">{servico}</span>
                  </label>
                );
              })}
            </div>
          </section>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-70 shadow-sm"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Salvar Meus Dados
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3 text-slate-700">
        <Building2 className="w-5 h-5 text-blue-700" />
        <span className="text-sm">As informações ficam vinculadas ao município do usuário logado.</span>
      </div>
    </div>
  );
}
