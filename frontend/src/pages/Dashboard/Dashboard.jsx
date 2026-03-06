import React, { useState, useEffect } from 'react';
import { Users, Sprout, Tractor, ClipboardList, TrendingUp, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../../services/dashboardService';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: {
      produtores: 0,
      propriedades: 0,
      atendimentos: 0,
      maquinas: 0
    },
    recentActivities: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const dashboardData = await dashboardService.getStats();
      setData(dashboardData);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Produtores', value: data.stats.produtores, icon: Users, color: 'bg-blue-500', path: '/produtores' },
    { label: 'Propriedades', value: data.stats.propriedades, icon: Sprout, color: 'bg-green-500', path: '/propriedades' },
    { label: 'Atendimentos', value: data.stats.atendimentos, icon: ClipboardList, color: 'bg-purple-500', path: '/atendimentos' },
    { label: 'Máquinas', value: data.stats.maquinas, icon: Tractor, color: 'bg-orange-500', path: '/recursos' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Visão Geral</h1>
          <p className="text-gray-500 text-sm">Resumo das atividades do município</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm">
          <Calendar className="w-4 h-4" />
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            onClick={() => navigate(stat.path)}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between cursor-pointer hover:shadow-md transition-all hover:-translate-y-1"
          >
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
              <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Atividades Recentes
          </h3>
          <div className="space-y-4">
            {data.recentActivities.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Nenhuma atividade recente.</p>
            ) : (
              data.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 font-bold text-xs">
                    {activity.tecnico_nome.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Visita Técnica realizada</p>
                    <p className="text-xs text-gray-500">{activity.tecnico_nome} • {activity.produtor_nome}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Tractor className="w-5 h-5 text-orange-600" />
            Disponibilidade de Máquinas
          </h3>
          {/* Mocked data for now as per requirement, but could be dynamic later */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tratores</span>
              <div className="flex gap-1">
                <span className="w-20 h-2 bg-green-500 rounded-full"></span>
                <span className="w-10 h-2 bg-gray-200 rounded-full"></span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Caminhões</span>
              <div className="flex gap-1">
                <span className="w-12 h-2 bg-green-500 rounded-full"></span>
                <span className="w-16 h-2 bg-gray-200 rounded-full"></span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Implementos</span>
              <div className="flex gap-1">
                <span className="w-24 h-2 bg-green-500 rounded-full"></span>
                <span className="w-4 h-2 bg-gray-200 rounded-full"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
