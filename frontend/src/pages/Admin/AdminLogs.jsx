import React, { useEffect, useMemo, useState } from 'react';
import logService from '../../services/logService';
import { isAdminEstado, roleLabel } from '../../utils/roles';
import { useAuth } from '../../contexts/AuthContext';

const TAB_ACCESS = 'access';
const TAB_SYSTEM = 'system';

export default function AdminLogs() {
  const { user } = useAuth();
  const [tab, setTab] = useState(TAB_ACCESS);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [codigoIbge, setCodigoIbge] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const canFilterByIbge = isAdminEstado(user?.perfil);

  const params = useMemo(() => ({
    codigo_ibge: canFilterByIbge && codigoIbge ? codigoIbge : undefined,
    limit: 100
  }), [canFilterByIbge, codigoIbge]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const data = tab === TAB_ACCESS
          ? await logService.listarAcessos(params)
          : await logService.listarSistema(params);
        setLogs(data);
      } catch (error) {
        setErrorMessage(error?.response?.data?.message || 'Falha ao carregar logs.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params, tab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Logs Administrativos</h1>
          <p className="text-sm text-slate-500">Monitoramento de acessos e ações administrativas</p>
        </div>
        {canFilterByIbge && (
          <div className="w-full sm:w-72">
            <label className="block text-sm text-slate-600 mb-1">Filtro por código IBGE</label>
            <input
              value={codigoIbge}
              onChange={(event) => setCodigoIbge(event.target.value)}
              placeholder="Ex: 5103403"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => setTab(TAB_ACCESS)}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${tab === TAB_ACCESS ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Logs de Acesso
            </button>
            <button
              onClick={() => setTab(TAB_SYSTEM)}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${tab === TAB_SYSTEM ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Logs do Sistema
            </button>
          </div>
          <div className="text-xs text-slate-600">
            Últimos registros: <span className="font-semibold text-slate-800">{logs.length}</span>
          </div>
        </div>
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center gap-2">
          <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${tab === TAB_ACCESS ? 'bg-cyan-100 text-cyan-700' : 'bg-violet-100 text-violet-700'}`}>
            Fonte ativa: {tab === TAB_ACCESS ? 'Acesso' : 'Sistema'}
          </span>
          {codigoIbge && (
            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
              Filtro IBGE: {codigoIbge}
            </span>
          )}
        </div>

        {errorMessage ? (
          <div className="px-6 py-8 text-center text-red-600">{errorMessage}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4">Perfil</th>
                  <th className="px-6 py-4">Município</th>
                  {tab === TAB_ACCESS ? (
                    <>
                      <th className="px-6 py-4">IP</th>
                      <th className="px-6 py-4">Navegador</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4">Ação</th>
                      <th className="px-6 py-4">Tabela</th>
                      <th className="px-6 py-4">Registro</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={tab === TAB_ACCESS ? 6 : 7} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex justify-center items-center gap-2">
                        <div className="w-5 h-5 border-2 border-slate-700 border-t-transparent rounded-full animate-spin"></div>
                        Carregando logs...
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={tab === TAB_ACCESS ? 6 : 7} className="px-6 py-8 text-center text-gray-500">
                      Nenhum log encontrado.
                    </td>
                  </tr>
                ) : (
                  logs.map((item) => (
                    <tr key={`${tab}-${item.id}`} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(tab === TAB_ACCESS ? item.data_login : item.data).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{item.usuario_nome || `#${item.usuario_id}`}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{roleLabel(item.usuario_perfil)}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{item.codigo_ibge || '-'}</td>
                      {tab === TAB_ACCESS ? (
                        <>
                          <td className="px-6 py-4 text-sm text-gray-700">{item.ip || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{item.user_agent || '-'}</td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 text-sm text-gray-700">{item.acao || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{item.tabela || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{item.registro_id || '-'}</td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
