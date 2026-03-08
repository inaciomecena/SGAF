import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Pencil, Trash2, X, LocateFixed } from 'lucide-react';
import propriedadeService from '../../services/propriedadeService';
import produtorService from '../../services/produtorService';

const SISTEMAS_SAF_SUGESTOES = [
  'Agroflorestal Sucessional',
  'Silviagrícola',
  'Silvipastoril',
  'Agrossilvipastoril',
  'SAF Frutífero',
  'SAF Madeireiro',
  'SAF de Recuperação Ambiental',
  'Quintal Agroflorestal',
  'SAF Biodiverso',
  'SAF Comercial'
];

export default function PropriedadeForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const abaInicial = [1, 2, 3, 4].includes(Number(location.state?.abaInicial))
    ? Number(location.state?.abaInicial)
    : 1;
  const [abaAtiva, setAbaAtiva] = useState(abaInicial);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [produtores, setProdutores] = useState([]);
  const [culturasDisponiveis, setCulturasDisponiveis] = useState([]);
  const [producoes, setProducoes] = useState([]);
  const [loadingProducoes, setLoadingProducoes] = useState(false);
  const [savingProducao, setSavingProducao] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const produtorIdInicial = location.state?.produtorId || '';
  const [producaoForm, setProducaoForm] = useState({
    id: '',
    cultura_id: '',
    area_ha: '',
    quantidade_plantas: '',
    ano_implantacao: '',
    sistema_saf: '',
    observacoes: ''
  });

  const [formData, setFormData] = useState({
    produtor_id: produtorIdInicial,
    nome: '',
    area_total: '',
    area_produtiva: '',
    latitude: '',
    longitude: '',
    tipo: ''
  });

  const loadProdutores = useCallback(async () => {
    try {
      const data = await produtorService.listar();
      setProdutores(data);
    } catch (error) {
      console.error('Erro ao carregar produtores:', error);
    }
  }, []);

  const loadCulturasDisponiveis = useCallback(async () => {
    try {
      const data = await propriedadeService.listarCulturasDisponiveis();
      setCulturasDisponiveis(data);
    } catch (error) {
      if (error?.response?.status === 404) {
        setCulturasDisponiveis([]);
        return;
      }
      console.error('Erro ao carregar culturas:', error);
    }
  }, []);

  const loadProducoes = useCallback(async () => {
    if (!id) {
      return;
    }

    setLoadingProducoes(true);
    try {
      const data = await propriedadeService.listarCulturasPropriedade(id);
      setProducoes(data);
    } catch (error) {
      if (error?.response?.status === 404) {
        setProducoes([]);
        return;
      }
      console.error('Erro ao carregar produções:', error);
      alert('Não foi possível carregar as produções desta propriedade.');
    } finally {
      setLoadingProducoes(false);
    }
  }, [id]);

  useEffect(() => {
    loadProdutores();
    loadCulturasDisponiveis();
  }, [loadProdutores, loadCulturasDisponiveis]);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    const loadPropriedade = async () => {
      try {
        const data = await propriedadeService.detalhar(id);
        setFormData({
          produtor_id: data.produtor_id ? String(data.produtor_id) : '',
          nome: data.nome || '',
          area_total: data.area_total ?? '',
          area_produtiva: data.area_produtiva ?? '',
          latitude: data.latitude ?? '',
          longitude: data.longitude ?? '',
          tipo: data.tipo ? String(data.tipo) : ''
        });
      } catch (error) {
        if (error?.response?.status !== 404) {
          console.error('Erro ao carregar propriedade:', error);
        }
        alert('Não foi possível carregar a propriedade.');
        navigate('/propriedades');
      } finally {
        setInitialLoading(false);
      }
    };

    loadPropriedade();
  }, [id, isEditMode, navigate]);

  useEffect(() => {
    if (!isEditMode) {
      setProducoes([]);
      return;
    }

    loadProducoes();
  }, [isEditMode, loadProducoes]);

  useEffect(() => {
    if ([1, 2, 3, 4].includes(Number(location.state?.abaInicial))) {
      setAbaAtiva(Number(location.state?.abaInicial));
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProducaoChange = (e) => {
    const { name, value } = e.target;
    setProducaoForm(prev => ({ ...prev, [name]: value }));
  };

  const resetProducaoForm = () => {
    setProducaoForm({
      id: '',
      cultura_id: '',
      area_ha: '',
      quantidade_plantas: '',
      ano_implantacao: '',
      sistema_saf: '',
      observacoes: ''
    });
  };

  const handleSalvarProducao = async () => {
    if (!isEditMode || !id) {
      alert('Salve a propriedade para cadastrar produções.');
      return;
    }

    if (!producaoForm.cultura_id) {
      alert('Selecione uma cultura.');
      return;
    }

    setSavingProducao(true);
    try {
      const payload = {
        cultura_id: producaoForm.cultura_id,
        area_ha: producaoForm.area_ha,
        quantidade_plantas: producaoForm.quantidade_plantas,
        ano_implantacao: producaoForm.ano_implantacao,
        sistema_saf: producaoForm.sistema_saf,
        observacoes: producaoForm.observacoes
      };

      if (producaoForm.id) {
        await propriedadeService.atualizarCulturaPropriedade(id, producaoForm.id, payload);
      } else {
        await propriedadeService.adicionarCulturaPropriedade(id, payload);
      }

      resetProducaoForm();
      await loadProducoes();
    } catch (error) {
      console.error('Erro ao salvar produção:', error);
      alert('Não foi possível salvar a produção.');
    } finally {
      setSavingProducao(false);
    }
  };

  const handleEditarProducao = (producao) => {
    setProducaoForm({
      id: String(producao.id),
      cultura_id: String(producao.cultura_id || ''),
      area_ha: producao.area_ha ?? '',
      quantidade_plantas: producao.quantidade_plantas ?? '',
      ano_implantacao: producao.ano_implantacao ?? '',
      sistema_saf: producao.sistema_saf || '',
      observacoes: producao.observacoes || ''
    });
  };

  const handleExcluirProducao = async (culturaRegistroId) => {
    if (!id) {
      return;
    }

    const confirmed = window.confirm('Deseja realmente excluir esta produção?');
    if (!confirmed) {
      return;
    }

    try {
      await propriedadeService.excluirCulturaPropriedade(id, culturaRegistroId);
      if (String(producaoForm.id) === String(culturaRegistroId)) {
        resetProducaoForm();
      }
      await loadProducoes();
    } catch (error) {
      console.error('Erro ao excluir produção:', error);
      alert('Não foi possível excluir a produção.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      produtor_id: formData.produtor_id,
      nome: formData.nome,
      tipo: formData.tipo,
      area_total: formData.area_total,
      area_produtiva: formData.area_produtiva,
      latitude: formData.latitude,
      longitude: formData.longitude
    };

    try {
      if (isEditMode) {
        await propriedadeService.atualizar(id, payload);
        navigate('/propriedades');
      } else {
        const created = await propriedadeService.criar(formData.produtor_id, payload);
        if (created?.id) {
          navigate(`/propriedades/${created.id}/editar`, { state: { abaInicial: 3 } });
          return;
        }
        navigate('/propriedades');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar propriedade. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  const handlePegarLocalizacao = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não suportada neste navegador.');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setFormData((prev) => ({
          ...prev,
          latitude: Number(coords.latitude).toFixed(6),
          longitude: Number(coords.longitude).toFixed(6)
        }));
        setGettingLocation(false);
      },
      () => {
        alert('Não foi possível obter a localização. Verifique as permissões do navegador.');
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000
      }
    );
  };

  if (initialLoading) {
    return <div className="max-w-6xl mx-auto p-6 text-center text-gray-500">Carregando propriedade...</div>;
  }

  const areaTotal = Number(formData.area_total) || 0;
  const areaProdutiva = Number(formData.area_produtiva) || 0;
  const percentualProdutivo = areaTotal > 0 ? ((areaProdutiva / areaTotal) * 100).toFixed(1) : '0.0';
  const areaNaoProdutiva = Math.max(areaTotal - areaProdutiva, 0).toFixed(2);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/propriedades')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Editar Propriedade' : 'Nova Propriedade'}</h1>
          <p className="text-sm text-gray-500">Cadastro padronizado de propriedades rurais</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { id: 1, label: 'Aba 1', title: 'Dados Gerais' },
              { id: 2, label: 'Aba 2', title: 'Produção e Comercialização' },
              { id: 3, label: 'Aba 3', title: 'Produções' },
              { id: 4, label: 'Aba 4', title: 'Informações Complementares' }
            ].map((aba) => (
              <button
                key={aba.id}
                type="button"
                onClick={() => setAbaAtiva(aba.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  abaAtiva === aba.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {aba.label}
              </button>
            ))}
          </div>
        </div>

        {abaAtiva === 1 && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="text-sm font-semibold tracking-wide text-blue-700 uppercase">Aba 1 · Dados Gerais do Informante</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700">Produtor Responsável *</label>
                <select
                  name="produtor_id"
                  required
                  value={formData.produtor_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">Selecione um produtor...</option>
                  {produtores.map(p => (
                    <option key={p.id} value={p.id}>{p.nome} (CPF: {p.cpf})</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700">Nome da Propriedade *</label>
                <input
                  type="text"
                  name="nome"
                  required
                  value={formData.nome}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ex: Sítio Santo Antônio"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tipo de Propriedade</label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">Não informado</option>
                  <option value="1">Sítio</option>
                  <option value="2">Fazenda</option>
                  <option value="3">Chácara</option>
                  <option value="4">Estância</option>
                </select>
              </div>
            </div>
          </section>
        )}

        {abaAtiva === 2 && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="text-sm font-semibold tracking-wide text-blue-700 uppercase">Aba 2 · Produção e Comercialização</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Área Total (hectares)</label>
                <input
                  type="number"
                  step="0.01"
                  name="area_total"
                  value={formData.area_total}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Área Produtiva (hectares)</label>
                <input
                  type="number"
                  step="0.01"
                  name="area_produtiva"
                  value={formData.area_produtiva}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </section>
        )}

        {abaAtiva === 3 && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="text-sm font-semibold tracking-wide text-blue-700 uppercase">Aba 3 · Produções</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs text-blue-700 font-medium uppercase">Percentual produtivo</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{percentualProdutivo}%</p>
              </div>
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs text-blue-700 font-medium uppercase">Área não produtiva</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{areaNaoProdutiva} ha</p>
              </div>
            </div>

            {!isEditMode && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-sm">
                Salve a propriedade primeiro para cadastrar produções por cultura.
              </div>
            )}

            <div className="border border-gray-200 rounded-xl p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4">
                <div className="space-y-2 xl:col-span-3">
                  <label className="text-sm font-medium text-gray-700">Cultura *</label>
                  <select
                    name="cultura_id"
                    value={producaoForm.cultura_id}
                    onChange={handleProducaoChange}
                    disabled={!isEditMode || savingProducao}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-gray-100"
                  >
                    <option value="">Selecione...</option>
                    {culturasDisponiveis.map(cultura => (
                      <option key={cultura.id} value={cultura.id}>
                        {cultura.nome}{cultura.categoria ? ` (${cultura.categoria})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 xl:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Ano de Implantação</label>
                  <input
                    type="number"
                    min="1900"
                    max="2100"
                    name="ano_implantacao"
                    value={producaoForm.ano_implantacao}
                    onChange={handleProducaoChange}
                    disabled={!isEditMode || savingProducao}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                    placeholder="Ex: 2026"
                  />
                </div>

                <div className="space-y-2 xl:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Área (ha)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="area_ha"
                    value={producaoForm.area_ha}
                    onChange={handleProducaoChange}
                    disabled={!isEditMode || savingProducao}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                  />
                </div>

                <div className="space-y-2 xl:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Quantidade de Plantas</label>
                  <input
                    type="number"
                    min="0"
                    name="quantidade_plantas"
                    value={producaoForm.quantidade_plantas}
                    onChange={handleProducaoChange}
                    disabled={!isEditMode || savingProducao}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                  />
                </div>

                <div className="space-y-2 xl:col-span-3">
                  <label className="text-sm font-medium text-gray-700">Sistema SAF</label>
                  <input
                    type="text"
                    list="sistema-saf-sugestoes"
                    name="sistema_saf"
                    value={producaoForm.sistema_saf}
                    onChange={handleProducaoChange}
                    disabled={!isEditMode || savingProducao}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                    placeholder="Ex: Agroflorestal Sucessional"
                  />
                  <datalist id="sistema-saf-sugestoes">
                    {SISTEMAS_SAF_SUGESTOES.map((sistema) => (
                      <option key={sistema} value={sistema} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Observações</label>
                <textarea
                  rows={3}
                  name="observacoes"
                  value={producaoForm.observacoes}
                  onChange={handleProducaoChange}
                  disabled={!isEditMode || savingProducao}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                />
              </div>

              <div className="flex gap-2 justify-end">
                {producaoForm.id && (
                  <button
                    type="button"
                    onClick={resetProducaoForm}
                    disabled={savingProducao}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-70"
                  >
                    <span className="inline-flex items-center gap-2">
                      <X className="w-4 h-4" />
                      Cancelar edição
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSalvarProducao}
                  disabled={!isEditMode || savingProducao}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-70"
                >
                  {savingProducao
                    ? 'Salvando...'
                    : producaoForm.id
                      ? 'Atualizar produção'
                      : 'Adicionar produção'}
                </button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-x-auto">
              <table className="w-full text-sm min-w-[780px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Cultura</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Ano</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Área (ha)</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Qtd. Plantas</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Sistema SAF</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingProducoes && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-gray-500">Carregando produções...</td>
                    </tr>
                  )}
                  {!loadingProducoes && producoes.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-gray-500">Nenhuma produção cadastrada.</td>
                    </tr>
                  )}
                  {!loadingProducoes && producoes.map((producao) => (
                    <tr key={producao.id} className="border-t border-gray-100 odd:bg-white even:bg-slate-50/60 hover:bg-slate-100 transition-colors">
                      <td className="px-4 py-3 text-gray-800">{producao.cultura_nome}</td>
                      <td className="px-4 py-3 text-gray-700">{producao.ano_implantacao || '-'}</td>
                      <td className="px-4 py-3 text-gray-700">{producao.area_ha ?? '-'}</td>
                      <td className="px-4 py-3 text-gray-700">{producao.quantidade_plantas ?? '-'}</td>
                      <td className="px-4 py-3 text-gray-700">{producao.sistema_saf || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditarProducao(producao)}
                            disabled={!isEditMode}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExcluirProducao(producao.id)}
                            disabled={!isEditMode}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {abaAtiva === 4 && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="text-sm font-semibold tracking-wide text-blue-700 uppercase">Aba 4 · Informações Complementares</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Latitude</label>
                <input
                  type="text"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="-23.5505"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Longitude</label>
                <input
                  type="text"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="-46.6333"
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={handlePegarLocalizacao}
                  disabled={gettingLocation}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-60"
                >
                  {gettingLocation ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LocateFixed className="w-4 h-4" />
                  )}
                  {gettingLocation ? 'Obtendo localização...' : 'Pegar Localização'}
                </button>
              </div>
            </div>
          </section>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-70 shadow-sm"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isEditMode ? 'Atualizar Propriedade' : 'Salvar Propriedade'}
          </button>
        </div>
      </form>
    </div>
  );
}
