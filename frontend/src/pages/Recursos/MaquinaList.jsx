import React, { useState, useEffect } from 'react';
import { Plus, Search, Tractor, Settings, Calendar } from 'lucide-react';
import recursoService from '../../services/recursoService';
import { useNavigate } from 'react-router-dom';

export default function MaquinaList() {
  const [maquinas, setMaquinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadMaquinas();
  }, []);

  const loadMaquinas = async () => {
    try {
      const data = await recursoService.listarMaquinas();
      setMaquinas(data);
    } catch (error) {
      console.error('Erro ao carregar máquinas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMaquinas = maquinas.filter(m => 
    m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.modelo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Patrulha Mecanizada</h1>
          <p className="text-gray-500 text-sm">Gestão de máquinas e implementos agrícolas</p>
        </div>
        <button
          onClick={() => navigate('/recursos/maquinas/novo')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Nova Máquina
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome ou modelo..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {loading ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              Carregando máquinas...
            </div>
          ) : filteredMaquinas.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 flex flex-col items-center">
              <Tractor className="w-12 h-12 text-gray-300 mb-2" />
              Nenhuma máquina encontrada.
            </div>
          ) : (
            filteredMaquinas.map((maquina) => (
              <div key={maquina.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <Tractor className="w-8 h-8 text-green-600" />
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    maquina.status === 'ATIVO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {maquina.status}
                  </span>
                </div>
                
                <h3 className="font-bold text-gray-900 text-lg mb-1">{maquina.nome}</h3>
                <p className="text-gray-500 text-sm mb-4">{maquina.modelo} • {maquina.ano}</p>
                
                <div className="border-t border-gray-100 pt-4 mt-2 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Settings className="w-4 h-4 mr-2 text-gray-400" />
                    Placa: {maquina.placa || 'N/A'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    Manutenção: Em dia
                  </div>
                </div>

                <button className="w-full mt-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Gerenciar
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
