import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Search } from 'lucide-react';
import culturaService from '../../services/culturaService';

const CATEGORIAS = ['', 'ANUAL', 'FRUTIFERA', 'FLORESTAL', 'PERENE', 'MEDICINAL', 'CONDIMENTAR', 'ADUBACAO_VERDE', 'OLEAGINOSA', 'ENERGETICA'];
const CICLOS = ['', 'CURTO', 'MEDIO', 'LONGO', 'PERENE'];

export default function CulturaList() {
  const [loading, setLoading] = useState(true);
  const [culturas, setCulturas] = useState([]);
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('');
  const [tipoCiclo, setTipoCiclo] = useState('');

  useEffect(() => {
    const loadCulturas = async () => {
      setLoading(true);
      try {
        const data = await culturaService.listar({
          search: search || undefined,
          categoria: categoria || undefined,
          tipo_ciclo: tipoCiclo || undefined
        });
        setCulturas(data);
      } catch (error) {
        console.error('Erro ao carregar culturas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCulturas();
  }, [search, categoria, tipoCiclo]);

  const totalAtivas = useMemo(() => culturas.filter((item) => item.ativo).length, [culturas]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tabela de Culturas</h1>
          <p className="text-sm text-slate-500">Base de culturas SAF para uso em cadastros e planejamento</p>
        </div>
        <Link
          to="/tabelas/culturas/nova"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Cultura
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-slate-600">
            Total carregado: <span className="font-semibold text-slate-800">{culturas.length}</span>
          </span>
          <span className="text-sm text-slate-600">
            Ativas: <span className="font-semibold text-slate-800">{totalAtivas}</span>
          </span>
        </div>

        <div className="p-4 border-b border-slate-200 bg-slate-50/70 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar cultura, científico ou finalidade"
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <select
            value={categoria}
            onChange={(event) => setCategoria(event.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
          >
            {CATEGORIAS.map((item) => (
              <option key={item || 'TODAS'} value={item}>
                {item || 'Todas categorias'}
              </option>
            ))}
          </select>
          <select
            value={tipoCiclo}
            onChange={(event) => setTipoCiclo(event.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
          >
            {CICLOS.map((item) => (
              <option key={item || 'TODOS'} value={item}>
                {item || 'Todos ciclos'}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-slate-600 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Cultura</th>
                <th className="px-6 py-4">Nome científico</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Ciclo</th>
                <th className="px-6 py-4">Finalidade</th>
                <th className="px-6 py-4 text-right">Produção (anos)</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
                      Carregando culturas...
                    </div>
                  </td>
                </tr>
              ) : culturas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">Nenhuma cultura encontrada.</td>
                </tr>
              ) : (
                culturas.map((item) => (
                  <tr key={item.id} className="odd:bg-white even:bg-slate-50/60 hover:bg-slate-100 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{item.nome_cultura}</td>
                    <td className="px-6 py-4 text-slate-700">{item.nome_cientifico || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                        {item.categoria || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{item.tipo_ciclo || '-'}</td>
                    <td className="px-6 py-4 text-slate-700">{item.finalidade || '-'}</td>
                    <td className="px-6 py-4 text-right text-slate-700">{item.tempo_producao_anos || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/tabelas/culturas/${item.id}/editar`}
                        state={{ cultura: item }}
                        className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900"
                      >
                        <Pencil className="w-4 h-4" />
                        Editar
                      </Link>
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
