import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import culturaService from '../../services/culturaService';

const CATEGORIAS = ['ANUAL', 'FRUTIFERA', 'FLORESTAL', 'PERENE', 'MEDICINAL', 'CONDIMENTAR', 'ADUBACAO_VERDE', 'OLEAGINOSA', 'ENERGETICA'];
const CICLOS = ['CURTO', 'MEDIO', 'LONGO', 'PERENE'];

export default function CulturaForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome_cultura: '',
    nome_cientifico: '',
    categoria: 'ANUAL',
    tipo_ciclo: 'CURTO',
    finalidade: '',
    tempo_producao_anos: '',
    origem: '',
    observacoes: ''
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await culturaService.criar({
        ...formData,
        tempo_producao_anos: formData.tempo_producao_anos ? Number(formData.tempo_producao_anos) : null
      });
      navigate('/tabelas/culturas');
    } catch (error) {
      alert(error?.response?.data?.message || 'Erro ao cadastrar cultura');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/tabelas/culturas')}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Nova Cultura</h1>
          <p className="text-sm text-slate-500">Cadastro na tabela SAF de referência</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Nome da cultura</label>
            <input
              name="nome_cultura"
              required
              value={formData.nome_cultura}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Nome científico</label>
            <input
              name="nome_cientifico"
              value={formData.nome_cientifico}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Categoria</label>
            <select
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
            >
              {CATEGORIAS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Tipo de ciclo</label>
            <select
              name="tipo_ciclo"
              value={formData.tipo_ciclo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
            >
              {CICLOS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Finalidade</label>
            <input
              name="finalidade"
              value={formData.finalidade}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Tempo de produção (anos)</label>
            <input
              type="number"
              min="0"
              name="tempo_producao_anos"
              value={formData.tempo_producao_anos}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Origem</label>
            <input
              name="origem"
              value={formData.origem}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Observações</label>
            <textarea
              rows={4}
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors disabled:opacity-70"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Salvando...' : 'Salvar Cultura'}
          </button>
        </div>
      </form>
    </div>
  );
}
