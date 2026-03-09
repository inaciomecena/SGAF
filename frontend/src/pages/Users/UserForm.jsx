import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import userService from '../../services/userService';
import { useAuth } from '../../contexts/useAuth';
import { isAdminEstado, normalizeRole, roleLabel } from '../../utils/roles';

export default function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user: currentUser } = useAuth();
  const currentUserRole = normalizeRole(currentUser?.perfil);
  const isStateAdmin = isAdminEstado(currentUserRole);
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const profileOptions = isStateAdmin
    ? ['GESTOR_MUNICIPAL', 'TECNICO', 'OPERADOR']
    : ['TECNICO', 'OPERADOR'];
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    perfil: 'TECNICO',
    codigo_ibge: currentUser?.codigo_ibge || '',
  });

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    const loadUser = async () => {
      try {
        const data = await userService.detalhar(id);
        setFormData((prev) => ({
          ...prev,
          nome: data.nome || '',
          email: data.email || '',
          telefone: data.telefone || '',
          perfil: normalizeRole(data.perfil) || 'TECNICO',
          codigo_ibge: data.codigo_ibge || '',
          senha: ''
        }));
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        alert('Não foi possível carregar o usuário.');
        navigate('/secretaria/usuarios');
      } finally {
        setInitialLoading(false);
      }
    };

    loadUser();
  }, [id, isEditMode, navigate]);

  const listQuery = searchParams.get('codigo_ibge')
    ? `?codigo_ibge=${searchParams.get('codigo_ibge')}`
    : '';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditMode) {
        const payload = { ...formData };
        if (!payload.senha) {
          delete payload.senha;
        }
        await userService.atualizar(id, payload);
      } else {
        await userService.criar(formData);
      }
      navigate(`/secretaria/usuarios${listQuery}`);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar usuário. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="max-w-2xl mx-auto p-6 text-center text-gray-500">Carregando usuário...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/secretaria/usuarios${listQuery}`)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Editar Usuário' : 'Novo Usuário'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nome Completo</label>
            <input
              type="text"
              name="nome"
              required
              value={formData.nome}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ex: João da Silva"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="joao@exemplo.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Telefone</label>
            <input
              type="tel"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Senha</label>
            <input
              type="password"
              name="senha"
              required={!isEditMode}
              value={formData.senha}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder={isEditMode ? 'Deixe em branco para manter a senha atual' : 'Mínimo 6 caracteres'}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Perfil de Acesso</label>
            <select
              name="perfil"
              value={formData.perfil}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              {profileOptions.map((perfil) => (
                <option key={perfil} value={perfil}>
                  {roleLabel(perfil)}
                </option>
              ))}
            </select>
          </div>

          {isStateAdmin && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Código IBGE (Município)</label>
              <input
                type="text"
                name="codigo_ibge"
                required
                value={formData.codigo_ibge}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          )}
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isEditMode ? 'Atualizar Usuário' : 'Salvar Usuário'}
          </button>
        </div>
      </form>
    </div>
  );
}
