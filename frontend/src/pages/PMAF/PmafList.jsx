import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ExternalLink, FileText, Loader2, Search } from 'lucide-react';
import pmafService from '../../services/pmafService';

export default function PmafList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await pmafService.listar();
      setRows(Array.isArray(data) ? data : []);
    } catch (error) {
      alert(error?.response?.data?.message || 'Não foi possível carregar a lista do PMAF.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const codigo = String(row.codigo_ibge || '').toLowerCase();
      const nome = String(row.municipio_nome || '').toLowerCase();
      return codigo.includes(q) || nome.includes(q);
    });
  }, [rows, query]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center text-gray-500">
        Carregando PMAF...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">PMAF</h1>
          <p className="text-sm text-gray-500">Política Municipal de Agricultura Familiar e/ou Indígena</p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
        >
          <Loader2 className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por município ou IBGE..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left font-semibold px-4 py-3">Município</th>
                <th className="text-left font-semibold px-4 py-3">IBGE</th>
                <th className="text-left font-semibold px-4 py-3">Possui política</th>
                <th className="text-left font-semibold px-4 py-3">Documento</th>
                <th className="text-right font-semibold px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((row) => {
                const possui = row.possui_politica === null || row.possui_politica === undefined
                  ? '—'
                  : row.possui_politica
                    ? 'Sim'
                    : 'Não';
                return (
                  <tr key={row.codigo_ibge} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-800">{row.municipio_nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row.codigo_ibge}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                        {possui}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {row.documento_url ? (
                        <a
                          href={row.documento_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                        >
                          <FileText className="w-4 h-4" />
                          Abrir
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => navigate(`/pmaf/${row.codigo_ibge}`)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Nenhum município encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

