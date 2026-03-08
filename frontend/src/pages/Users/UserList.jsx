import React, { useCallback, useState, useEffect } from 'react';
import { Plus, Search, Mail, Phone } from 'lucide-react';
import userService from '../../services/userService';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { isAdminEstado, normalizeRole, roleLabel } from '../../utils/roles';
import { useAuth } from '../../contexts/AuthContext';

export default function UserList() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const codigoIbge = searchParams.get('codigo_ibge');
  const showMunicipioColumn = isAdminEstado(currentUser?.perfil) && !codigoIbge;

  const loadUsers = useCallback(async () => {
    try {
      const data = await userService.listar(codigoIbge);
      setUsers(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  }, [codigoIbge]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleEditar = (id) => {
    const query = codigoIbge ? `?codigo_ibge=${codigoIbge}` : '';
    navigate(`/secretaria/usuarios/${id}/editar${query}`);
  };

  const handleDesativar = async (user) => {
    const confirmed = window.confirm(`Deseja desativar o usuário ${user.nome}?`);
    if (!confirmed) {
      return;
    }

    setProcessingId(user.id);
    try {
      await userService.desativar(user.id);
      await loadUsers();
    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
      alert('Não foi possível desativar o usuário.');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gerenciar Usuários</h1>
          <p className="text-sm text-slate-500">Controle de acesso por município e perfil operacional</p>
        </div>
        <button
          onClick={() => {
            const query = codigoIbge ? `?codigo_ibge=${codigoIbge}` : '';
            navigate(`/secretaria/usuarios/novo${query}`);
          }}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {codigoIbge && (
          <div className="px-4 py-3 text-sm text-slate-600 border-b border-slate-200 bg-cyan-50">
            Exibindo usuários do município IBGE {codigoIbge}
          </div>
        )}
        {!codigoIbge && showMunicipioColumn && (
          <div className="px-4 py-3 text-sm text-slate-600 border-b border-slate-200 bg-slate-50">
            Exibindo usuários de todos os municípios
          </div>
        )}
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm text-slate-600">
            {filteredUsers.length} de {users.length} usuários
          </div>
          <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium">
            Acesso ativo
          </div>
        </div>
        <div className="p-4 border-b border-slate-200 bg-slate-50/70">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-slate-600 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Perfil</th>
                {showMunicipioColumn && <th className="px-6 py-4">Município</th>}
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={showMunicipioColumn ? 6 : 5} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-slate-700 border-t-transparent rounded-full animate-spin"></div>
                      Carregando usuários...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={showMunicipioColumn ? 6 : 5} className="px-6 py-8 text-center text-gray-500">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="odd:bg-white even:bg-slate-50/60 hover:bg-slate-100 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold">
                          {user.nome.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.nome}</div>
                          <div className="text-sm text-gray-500 hidden sm:block">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {user.email}
                        </div>
                        {user.telefone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {user.telefone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        normalizeRole(user.perfil) === 'GESTOR_MUNICIPAL'
                          ? 'bg-purple-100 text-purple-800'
                          : normalizeRole(user.perfil) === 'TECNICO'
                            ? 'bg-cyan-100 text-cyan-800'
                            : normalizeRole(user.perfil) === 'OPERADOR'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}>
                        {roleLabel(user.perfil)}
                      </span>
                    </td>
                    {showMunicipioColumn && (
                      <td className="px-6 py-4 text-sm text-gray-700">{user.codigo_ibge || '-'}</td>
                    )}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Ativo
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEditar(user.id)}
                        className="text-slate-600 hover:text-slate-900 transition-colors mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDesativar(user)}
                        disabled={processingId === user.id}
                        className="text-rose-600 hover:text-rose-800 transition-colors disabled:opacity-60"
                      >
                        {processingId === user.id ? 'Desativando...' : 'Desativar'}
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
