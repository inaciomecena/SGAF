import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Calendar, FileText } from 'lucide-react';
import atendimentoService from '../../services/atendimentoService';
import produtorService from '../../services/produtorService';
import propriedadeService from '../../services/propriedadeService';

export default function AtendimentoForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [produtores, setProdutores] = useState([]);
  const [propriedades, setPropriedades] = useState([]);
  
  const [formData, setFormData] = useState({
    produtor_id: '',
    propriedade_id: '',
    data_visita: new Date().toISOString().split('T')[0],
    motivo: '',
    observacoes: '',
    recomendacoes: ''
  });

  useEffect(() => {
    loadProdutores();
  }, []);

  // Carrega propriedades quando o produtor é selecionado
  useEffect(() => {
    if (formData.produtor_id) {
      loadPropriedades(formData.produtor_id);
    } else {
      setPropriedades([]);
    }
  }, [formData.produtor_id]);

  const loadProdutores = async () => {
    try {
      const data = await produtorService.listar();
      setProdutores(data);
    } catch (error) {
      console.error('Erro ao carregar produtores:', error);
    }
  };

  const loadPropriedades = async (produtorId) => {
    try {
      const data = await propriedadeService.listarPorProdutor(produtorId);
      setPropriedades(data);
    } catch (error) {
      console.error('Erro ao carregar propriedades:', error);
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
      await atendimentoService.registrar(formData);
      navigate('/atendimentos');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao registrar atendimento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/atendimentos')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Registrar Atendimento</h1>
          <p className="text-sm text-gray-500">Nova visita técnica ou assistência</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Produtor *</label>
            <select
              name="produtor_id"
              required
              value={formData.produtor_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">Selecione...</option>
              {produtores.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Propriedade</label>
            <select
              name="propriedade_id"
              value={formData.propriedade_id}
              onChange={handleChange}
              disabled={!formData.produtor_id}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-gray-50"
            >
              <option value="">Selecione (Opcional)...</option>
              {propriedades.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Data da Visita *</label>
            <input
              type="date"
              name="data_visita"
              required
              value={formData.data_visita}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Motivo da Visita *</label>
            <input
              type="text"
              name="motivo"
              required
              value={formData.motivo}
              onChange={handleChange}
              placeholder="Ex: Análise de solo, Pragas, etc."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-700">Observações</label>
            <textarea
              name="observacoes"
              rows="3"
              value={formData.observacoes}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Descreva o que foi observado..."
            ></textarea>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-700">Recomendações Técnicas</label>
            <textarea
              name="recomendacoes"
              rows="4"
              value={formData.recomendacoes}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Orientações passadas ao produtor..."
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-70 shadow-sm"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Registrar Atendimento
          </button>
        </div>
      </form>
    </div>
  );
}
