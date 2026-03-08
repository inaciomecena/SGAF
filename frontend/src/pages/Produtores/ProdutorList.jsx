import React, { useState, useEffect } from 'react';
import { Plus, Search, User, MapPin, Phone, Tractor } from 'lucide-react';
import produtorService from '../../services/produtorService';
import { useNavigate } from 'react-router-dom';

export default function ProdutorList() {
  const [produtores, setProdutores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadProdutores();
  }, []);

  const loadProdutores = async () => {
    try {
      const data = await produtorService.listar();
      setProdutores(data);
    } catch (error) {
      console.error('Erro ao carregar produtores:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProdutores = produtores.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cpf?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Produtores Rurais</h1>
          <p className="text-slate-500 text-sm">Gerencie o cadastro de produtores e suas atividades</p>
        </div>
        <button
          onClick={() => navigate('/produtores/novo')}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Novo Produtor
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm text-slate-600">
            {filteredProdutores.length} de {produtores.length} produtores
          </div>
          <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium">
            Cadastro ativo
          </div>
        </div>
        <div className="p-4 border-b border-slate-200 bg-slate-50/70">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF ou DAP..."
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
                <th className="px-6 py-4">Produtor</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Localização</th>
                <th className="px-6 py-4">Situação</th>
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
              ) : filteredProdutores.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Tractor className="w-10 h-10 text-gray-300" />
                      <p>Nenhum produtor encontrado.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProdutores.map((produtor) => (
                  <tr key={produtor.id} className="odd:bg-white even:bg-slate-50/60 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => navigate(`/produtores/${produtor.id}`)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold">
                          {produtor.nome.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{produtor.nome}</div>
                          <div className="text-xs text-gray-500">CPF: {produtor.cpf}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-sm text-gray-600">
                        {produtor.telefone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {produtor.telefone}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Sem telefone</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {produtor.cidade || 'Não informado'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {produtor.caf_dap ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          DAP/CAF Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Pendente
                        </span>
                      )}
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
