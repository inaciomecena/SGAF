import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Tractor } from 'lucide-react';
import recursoService from '../../services/recursoService';

export default function MaquinaForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'TRATOR', // TRATOR, CAMINHAO, IMPLEMENTO
    modelo: '',
    placa: '',
    ano: new Date().getFullYear(),
    status: 'ATIVO'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await recursoService.criarMaquina(formData);
      navigate('/recursos/maquinas');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar máquina.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/recursos/maquinas')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Nova Máquina</h1>
          <p className="text-sm text-gray-500">Cadastro de maquinário e equipamentos</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-700">Nome / Identificação *</label>
            <input
              type="text"
              name="nome"
              required
              value={formData.nome}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ex: Trator John Deere 01"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tipo de Equipamento</label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="TRATOR">Trator</option>
              <option value="CAMINHAO">Caminhão</option>
              <option value="RETROESCAVADEIRA">Retroescavadeira</option>
              <option value="IMPLEMENTO">Implemento</option>
              <option value="VEICULO_LEVE">Veículo Leve</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Modelo</label>
            <input
              type="text"
              name="modelo"
              value={formData.modelo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ex: 5078E"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Placa (se houver)</label>
            <input
              type="text"
              name="placa"
              value={formData.placa}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="ABC-1234"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Ano de Fabricação</label>
            <input
              type="number"
              name="ano"
              value={formData.ano}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status Operacional</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="ATIVO">Ativo</option>
              <option value="MANUTENCAO">Em Manutenção</option>
              <option value="INATIVO">Inativo</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-70 shadow-sm"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Salvar Máquina
          </button>
        </div>
      </form>
    </div>
  );
}
