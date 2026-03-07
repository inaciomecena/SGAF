import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Plus, ScrollText, Users } from 'lucide-react';
import municipioService from '../../services/municipioService';
import { isAdminEstado } from '../../utils/roles';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminPanel() {
  const { user } = useAuth();
  const [municipios, setMunicipios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    codigo_ibge: '',
    nome: '',
    estado: 'MT',
    regiao: 'Centro-Oeste'
  });

  useEffect(() => {
    const loadMunicipios = async () => {
      try {
        const data = await municipioService.listar();
        setMunicipios(data);
      } finally {
        setLoading(false);
      }
    };

    loadMunicipios();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      await municipioService.criar(formData);
      const data = await municipioService.listar();
      setMunicipios(data);
      setFormData({
        codigo_ibge: '',
        nome: '',
        estado: 'MT',
        regiao: 'Centro-Oeste'
      });
    } catch (error) {
      alert(error?.response?.data?.message || 'Erro ao criar município');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Módulo SECRETARIA</h1>
          <p className="text-sm text-slate-500">Gestão estadual e municipal de usuários, municípios e auditoria</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/secretaria/logs"
            className="bg-slate-50 hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border border-slate-200"
          >
            <ScrollText className="w-5 h-5" />
            Ver Logs
          </Link>
          <Link
            to="/secretaria/usuarios"
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Users className="w-5 h-5" />
            Gerenciar Usuários
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs uppercase font-semibold text-slate-500">Municípios</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{municipios.length}</p>
          <p className="text-xs text-slate-500 mt-1">Base de gestão territorial</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs uppercase font-semibold text-slate-500">Escopo</p>
          <p className="text-base font-semibold text-slate-900 mt-1">{isAdminEstado(user?.perfil) ? 'ESTADUAL' : 'MUNICIPAL'}</p>
          <p className="text-xs text-slate-500 mt-1">
            {isAdminEstado(user?.perfil) ? 'Gerencia todos os municípios' : `Gerencia município ${user?.codigo_ibge || '-'}`}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs uppercase font-semibold text-slate-500">Ação rápida</p>
          <Link to="/secretaria/usuarios/novo" className="mt-1 inline-flex text-sm font-semibold text-slate-700 hover:text-slate-900">
            Criar novo usuário
          </Link>
          <p className="text-xs text-slate-500 mt-1">Controle de acesso por perfil</p>
        </div>
      </div>

      {isAdminEstado(user?.perfil) && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Novo Município</h2>
              <p className="text-xs text-slate-500">Cadastro territorial para habilitar gestão local de usuários</p>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
              Administração estadual
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              required
              value={formData.codigo_ibge}
              onChange={(event) => setFormData((prev) => ({ ...prev, codigo_ibge: event.target.value }))}
              placeholder="Código IBGE"
              className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
            />
            <input
              required
              value={formData.nome}
              onChange={(event) => setFormData((prev) => ({ ...prev, nome: event.target.value }))}
              placeholder="Nome do município"
              className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none md:col-span-2"
            />
            <button
              type="submit"
              disabled={saving}
              className="bg-slate-900 hover:bg-slate-800 disabled:opacity-70 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {saving ? 'Salvando...' : 'Criar'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-500" />
            <h2 className="text-base font-semibold text-slate-800">Municípios</h2>
          </div>
          <div className="text-xs text-slate-600">
            Total cadastrado: <span className="font-semibold text-slate-800">{municipios.length}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-slate-600 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Código IBGE</th>
                <th className="px-6 py-4">Município</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Usuários</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-slate-700 border-t-transparent rounded-full animate-spin"></div>
                      Carregando municípios...
                    </div>
                  </td>
                </tr>
              ) : municipios.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                    Nenhum município cadastrado.
                  </td>
                </tr>
              ) : (
                municipios.map((municipio) => (
                  <tr key={municipio.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                        {municipio.codigo_ibge}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-medium">{municipio.nome}</td>
                    <td className="px-6 py-4 text-gray-700">{municipio.estado}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/secretaria/usuarios?codigo_ibge=${municipio.codigo_ibge}`}
                        className="text-slate-700 hover:text-slate-900 font-medium"
                      >
                        Ver usuários
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
