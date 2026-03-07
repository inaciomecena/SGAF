import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, User, ClipboardList } from 'lucide-react';
import atendimentoService from '../../services/atendimentoService';
import { useNavigate } from 'react-router-dom';

export default function AtendimentoList() {
  const [atendimentos, setAtendimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadAtendimentos();
  }, []);

  const loadAtendimentos = async () => {
    try {
      const data = await atendimentoService.listar();
      setAtendimentos(data);
    } catch (error) {
      console.error('Erro ao carregar atendimentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAtendimentos = atendimentos.filter(a => 
    a.produtor_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.motivo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Atendimentos Técnicos</h1>
          <p className="text-slate-500 text-sm">Histórico de visitas e assistência técnica</p>
        </div>
        <button
          onClick={() => navigate('/atendimentos/novo')}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Novo Atendimento
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm text-slate-600">
            {filteredAtendimentos.length} de {atendimentos.length} atendimentos
          </div>
          <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-violet-50 text-violet-700 text-xs font-medium">
            Agenda técnica
          </div>
        </div>
        <div className="p-4 border-b border-slate-200 bg-slate-50/70">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por produtor ou motivo..."
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
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Produtor / Propriedade</th>
                <th className="px-6 py-4">Motivo</th>
                <th className="px-6 py-4">Técnico</th>
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
              ) : filteredAtendimentos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <ClipboardList className="w-10 h-10 text-gray-300" />
                      <p>Nenhum atendimento registrado.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAtendimentos.map((atendimento) => (
                  <tr key={atendimento.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(atendimento.data_atendimento || atendimento.data_visita).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{atendimento.produtor_nome}</div>
                      <div className="text-xs text-gray-500">{atendimento.propriedade_nome || 'Propriedade não informada'}</div>
                    </td>
                    <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
                        {atendimento.motivo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4 text-gray-400" />
                        {atendimento.tecnico_nome}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-sm font-medium text-slate-700 hover:text-slate-900">
                        Detalhes
                      </button>
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
