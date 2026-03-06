import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Map, Ruler } from 'lucide-react';
import propriedadeService from '../../services/propriedadeService';
import produtorService from '../../services/produtorService';

export default function PropriedadeForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [produtores, setProdutores] = useState([]);
  
  // Se vier da tela de detalhes do produtor, já traz o ID preenchido
  const produtorIdInicial = location.state?.produtorId || '';

  const [formData, setFormData] = useState({
    produtor_id: produtorIdInicial,
    nome: '',
    area_total: '',
    area_produtiva: '',
    latitude: '',
    longitude: '',
    tipo: 'SITIO' // SITIO, FAZENDA, CHACARA
  });

  useEffect(() => {
    loadProdutores();
  }, []);

  const loadProdutores = async () => {
    try {
      const data = await produtorService.listar();
      setProdutores(data);
    } catch (error) {
      console.error('Erro ao carregar produtores:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await propriedadeService.criar(formData.produtor_id, formData);
      navigate('/propriedades');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar propriedade. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/propriedades')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Nova Propriedade</h1>
          <p className="text-sm text-gray-500">Cadastre as terras e áreas produtivas</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-700">Produtor Responsável *</label>
            <select
              name="produtor_id"
              required
              value={formData.produtor_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
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
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Ex: Sítio Santo Antônio"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Área Total (hectares)</label>
            <input
              type="number"
              step="0.01"
              name="area_total"
              value={formData.area_total}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
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
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Latitude</label>
            <input
              type="text"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
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
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="-46.6333"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tipo de Propriedade</label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
            >
              <option value="SITIO">Sítio</option>
              <option value="FAZENDA">Fazenda</option>
              <option value="CHACARA">Chácara</option>
              <option value="ESTANCIA">Estância</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-70 shadow-sm"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Salvar Propriedade
          </button>
        </div>
      </form>
    </div>
  );
}
