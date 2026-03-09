import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Fuel, Car, Calendar, Gauge, History } from 'lucide-react';
import frotaService from '../../services/frotaService';
import { useToast } from '../../contexts/ToastContext';

export default function VeiculosList() {
  const toast = useToast();
  const [veiculos, setVeiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [abastecimentoModalOpen, setAbastecimentoModalOpen] = useState(false);
  const [historicoModalOpen, setHistoricoModalOpen] = useState(false);
  const [historicoAbastecimentos, setHistoricoAbastecimentos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [editando, setEditando] = useState(null);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState(null);

  // Estados do formulário de veículo
  const [formData, setFormData] = useState({
    placa: '',
    modelo: '',
    marca: '',
    ano: new Date().getFullYear(),
    tipo: 'Carro',
    odometro_atual: 0,
    status: 'disponivel'
  });

  // Estados do formulário de abastecimento
  const [abastecimentoData, setAbastecimentoData] = useState({
    data: new Date().toISOString().split('T')[0],
    litros: '',
    valor_total: '',
    odometro: '',
    posto: '',
    tipo_combustivel: 'Gasolina'
  });

  useEffect(() => {
    carregarVeiculos();
  }, []);

  const carregarVeiculos = async () => {
    try {
      setLoading(true);
      const data = await frotaService.listarVeiculos();
      setVeiculos(data);
    } catch (error) {
      toast.error('Erro ao carregar veículos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await frotaService.atualizarVeiculo(editando.id, formData);
        toast.success('Veículo atualizado com sucesso');
      } else {
        await frotaService.criarVeiculo(formData);
        toast.success('Veículo cadastrado com sucesso');
      }
      setModalOpen(false);
      setEditando(null);
      setFormData({
        placa: '',
        modelo: '',
        marca: '',
        ano: new Date().getFullYear(),
        tipo: 'Carro',
        odometro_atual: 0,
        status: 'disponivel'
      });
      carregarVeiculos();
    } catch (error) {
      toast.error('Erro ao salvar veículo');
    }
  };

  const handleAbastecimentoSubmit = async (e) => {
    e.preventDefault();
    try {
      await frotaService.registrarAbastecimento({
        ...abastecimentoData,
        veiculo_id: veiculoSelecionado.id
      });
      toast.success('Abastecimento registrado com sucesso');
      setAbastecimentoModalOpen(false);
      setVeiculoSelecionado(null);
      setAbastecimentoData({
        data: new Date().toISOString().split('T')[0],
        litros: '',
        valor_total: '',
        odometro: '',
        posto: '',
        tipo_combustivel: 'Gasolina'
      });
      carregarVeiculos(); // Atualiza odômetro na lista
    } catch (error) {
      toast.error('Erro ao registrar abastecimento');
    }
  };

  const handleEdit = (veiculo) => {
    setEditando(veiculo);
    setFormData({
      placa: veiculo.placa,
      modelo: veiculo.modelo,
      marca: veiculo.marca,
      ano: veiculo.ano,
      tipo: veiculo.tipo,
      odometro_atual: veiculo.odometro_atual,
      status: veiculo.status
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja remover este veículo?')) {
      try {
        await frotaService.removerVeiculo(id);
        toast.success('Veículo removido com sucesso');
        carregarVeiculos();
      } catch (error) {
        toast.error('Erro ao remover veículo');
      }
    }
  };

  const openAbastecimento = (veiculo) => {
    setVeiculoSelecionado(veiculo);
    setAbastecimentoData(prev => ({ ...prev, odometro: veiculo.odometro_atual }));
    setAbastecimentoModalOpen(true);
  };

  const openHistorico = async (veiculo) => {
    setVeiculoSelecionado(veiculo);
    try {
      const dados = await frotaService.listarAbastecimentos(veiculo.id);
      setHistoricoAbastecimentos(dados);
      setHistoricoModalOpen(true);
    } catch (error) {
      toast.error('Erro ao carregar histórico');
    }
  };

  const veiculosFiltrados = veiculos.filter(v => 
    v.modelo.toLowerCase().includes(filtro.toLowerCase()) ||
    v.placa.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestão de Frota</h1>
          <p className="text-slate-600">Gerencie veículos e abastecimentos</p>
        </div>
        <button
          onClick={() => {
            setEditando(null);
            setFormData({
              placa: '',
              modelo: '',
              marca: '',
              ano: new Date().getFullYear(),
              tipo: 'Carro',
              odometro_atual: 0,
              status: 'disponivel'
            });
            setModalOpen(true);
          }}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Veículo
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por modelo ou placa..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500">Carregando frota...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {veiculosFiltrados.map((veiculo) => (
            <div key={veiculo.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Car className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{veiculo.modelo}</h3>
                    <p className="text-sm text-slate-500">{veiculo.marca} • {veiculo.ano}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  veiculo.status === 'disponivel' ? 'bg-green-100 text-green-700' :
                  veiculo.status === 'manutencao' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {veiculo.status.toUpperCase()}
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Car className="w-4 h-4" /> Placa
                  </span>
                  <span className="font-medium text-slate-700">{veiculo.placa}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Gauge className="w-4 h-4" /> Odômetro
                  </span>
                  <span className="font-medium text-slate-700">{veiculo.odometro_atual} km</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button
                  onClick={() => openAbastecimento(veiculo)}
                  className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-1 text-sm font-medium"
                  title="Registrar Abastecimento"
                >
                  <Fuel className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openHistorico(veiculo)}
                  className="flex-1 bg-slate-50 text-slate-600 py-2 rounded-lg hover:bg-slate-100 flex items-center justify-center gap-1 text-sm font-medium"
                  title="Histórico de Abastecimentos"
                >
                  <History className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEdit(veiculo)}
                  className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(veiculo.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Cadastro/Edição de Veículo */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              {editando ? 'Editar Veículo' : 'Novo Veículo'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Placa</label>
                  <input
                    required
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    value={formData.placa}
                    onChange={e => setFormData({...formData, placa: e.target.value.toUpperCase()})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    value={formData.tipo}
                    onChange={e => setFormData({...formData, tipo: e.target.value})}
                  >
                    <option value="Carro">Carro</option>
                    <option value="Moto">Moto</option>
                    <option value="Caminhonete">Caminhonete</option>
                    <option value="Caminhão">Caminhão</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Modelo</label>
                <input
                  required
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  value={formData.modelo}
                  onChange={e => setFormData({...formData, modelo: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Marca</label>
                  <input
                    required
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    value={formData.marca}
                    onChange={e => setFormData({...formData, marca: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ano</label>
                  <input
                    required
                    type="number"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    value={formData.ano}
                    onChange={e => setFormData({...formData, ano: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Odômetro Atual (Km)</label>
                  <input
                    required
                    type="number"
                    step="0.1"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    value={formData.odometro_atual}
                    onChange={e => setFormData({...formData, odometro_atual: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="disponivel">Disponível</option>
                    <option value="em_uso">Em Uso</option>
                    <option value="manutencao">Manutenção</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Histórico */}
      {historicoModalOpen && veiculoSelecionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Histórico de Abastecimentos</h2>
                <p className="text-sm text-slate-500">{veiculoSelecionado.modelo} - {veiculoSelecionado.placa}</p>
              </div>
              <button onClick={() => setHistoricoModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            
            {historicoAbastecimentos.length === 0 ? (
              <p className="text-center py-8 text-slate-500">Nenhum abastecimento registrado.</p>
            ) : (
              <div className="space-y-4">
                {historicoAbastecimentos.map((a) => (
                  <div key={a.id} className="border border-slate-100 rounded-lg p-3 bg-slate-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-slate-800">{new Date(a.data).toLocaleDateString()}</p>
                        <p className="text-sm text-slate-500">{a.posto || 'Posto não informado'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">R$ {parseFloat(a.valor_total).toFixed(2)}</p>
                        <p className="text-xs text-slate-500">{a.tipo_combustivel}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-4 text-sm text-slate-600 border-t border-slate-200 pt-2">
                      <span>{a.litros} L</span>
                      <span>{a.odometro} km (Odo)</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setHistoricoModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Abastecimento */}
      {abastecimentoModalOpen && veiculoSelecionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-1">Registrar Abastecimento</h2>
            <p className="text-sm text-slate-500 mb-4">{veiculoSelecionado.modelo} - {veiculoSelecionado.placa}</p>
            
            <form onSubmit={handleAbastecimentoSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                  <input
                    required
                    type="date"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    value={abastecimentoData.data}
                    onChange={e => setAbastecimentoData({...abastecimentoData, data: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Combustível</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    value={abastecimentoData.tipo_combustivel}
                    onChange={e => setAbastecimentoData({...abastecimentoData, tipo_combustivel: e.target.value})}
                  >
                    <option value="Gasolina">Gasolina</option>
                    <option value="Etanol">Etanol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="GNV">GNV</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Litros</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    value={abastecimentoData.litros}
                    onChange={e => setAbastecimentoData({...abastecimentoData, litros: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor Total (R$)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    value={abastecimentoData.valor_total}
                    onChange={e => setAbastecimentoData({...abastecimentoData, valor_total: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Odômetro (Km)</label>
                <input
                  required
                  type="number"
                  step="0.1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  value={abastecimentoData.odometro}
                  onChange={e => setAbastecimentoData({...abastecimentoData, odometro: e.target.value})}
                />
                <p className="text-xs text-slate-500 mt-1">Anterior: {veiculoSelecionado.odometro_atual} km</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Posto</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  value={abastecimentoData.posto}
                  onChange={e => setAbastecimentoData({...abastecimentoData, posto: e.target.value})}
                  placeholder="Nome do posto"
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setAbastecimentoModalOpen(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
