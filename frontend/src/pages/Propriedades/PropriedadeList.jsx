import React, { useState, useEffect } from 'react';
import { Plus, Search, Map, User, Ruler } from 'lucide-react';
import propriedadeService from '../../services/propriedadeService';
import { useNavigate } from 'react-router-dom';

export default function PropriedadeList() {
  const [propriedades, setPropriedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Propriedades Rurais</h1>
          <p className="text-gray-500 text-sm">Gerencie as propriedades cadastradas no município</p>
        </div>
        {/* Botão de nova propriedade geralmente é via produtor, mas podemos deixar aqui redirecionando para seleção de produtor ou algo assim */}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome da propriedade ou produtor..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
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
                      <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
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
                  <tr key={propriedade.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-700">
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
                      <button className="text-sm font-medium text-green-600 hover:text-green-800">
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
