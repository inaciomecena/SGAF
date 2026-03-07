import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Map, User, Ruler, Plus, Pencil, Trash2 } from 'lucide-react';
import propriedadeService from '../../services/propriedadeService';

export default function PropriedadeList() {
  const navigate = useNavigate();
  const [propriedades, setPropriedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPropriedades();
  }, []);

  const loadPropriedades = async () => {
    try {
      const data = await propriedadeService.listar();
      setPropriedades(data);
    } catch (error) {
      console.error('Erro ao carregar propriedades:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPropriedades = propriedades.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.produtor_nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    const confirmar = window.confirm('Deseja realmente excluir esta propriedade?');
    if (!confirmar) {
      return;
    }

    try {
      await propriedadeService.excluir(id);
      await loadPropriedades();
    } catch (error) {
      console.error('Erro ao excluir propriedade:', error);
      alert('Não foi possível excluir a propriedade.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Propriedades Rurais</h1>
          <p className="text-slate-500 text-sm">Gerencie as propriedades cadastradas no município</p>
        </div>
        <button
          onClick={() => navigate('/propriedades/novo')}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Propriedade
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm text-slate-600">
            {filteredPropriedades.length} de {propriedades.length} propriedades
          </div>
          <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-cyan-50 text-cyan-700 text-xs font-medium">
            Base territorial
          </div>
        </div>
        <div className="p-4 border-b border-slate-200 bg-slate-50/70">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome da propriedade ou produtor..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-slate-600 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Propriedade</th>
                <th className="px-6 py-4">Produtor Responsável</th>
                <th className="px-6 py-4">Área (ha)</th>
                <th className="px-6 py-4">Localização</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-slate-700 border-t-transparent rounded-full animate-spin"></div>
                      Carregando registros...
                    </div>
                  </td>
                </tr>
              ) : filteredPropriedades.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Map className="w-10 h-10 text-gray-300" />
                      <p>Nenhuma propriedade encontrada.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPropriedades.map((propriedade) => (
                  <tr key={propriedade.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                          <Map className="w-5 h-5" />
                        </div>
                        <div className="font-medium text-gray-900">{propriedade.nome}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4 text-gray-400" />
                        {propriedade.produtor_nome}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Ruler className="w-4 h-4 text-gray-400" />
                        {propriedade.area_total} ha
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {propriedade.latitude ? `${propriedade.latitude}, ${propriedade.longitude}` : 'Sem coordenadas'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <button
                          onClick={() => navigate(`/propriedades/${propriedade.id}/editar`)}
                          className="text-sm font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1"
                        >
                          <Pencil className="w-4 h-4" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(propriedade.id)}
                          className="text-sm font-medium text-rose-600 hover:text-rose-800 flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
