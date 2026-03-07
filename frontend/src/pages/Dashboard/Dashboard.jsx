import React, { useState, useEffect } from 'react';
import { Users, Sprout, Tractor, ClipboardList, TrendingUp, Calendar, ArrowUpRight, BarChart3, Settings2 } from 'lucide-react';
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
    { label: 'Total Produtores', value: data.stats.produtores, icon: Users, color: 'from-cyan-500 to-blue-600', path: '/produtores' },
    { label: 'Total Propriedades', value: data.stats.propriedades, icon: Sprout, color: 'from-emerald-500 to-teal-600', path: '/propriedades' },
    { label: 'Total Atendimentos', value: data.stats.atendimentos, icon: ClipboardList, color: 'from-violet-500 to-indigo-600', path: '/atendimentos' },
    { label: 'Total Máquinas', value: data.stats.maquinas, icon: Tractor, color: 'from-amber-500 to-orange-600', path: '/recursos' },
  ];
  const totalBase = stats.reduce((acc, item) => acc + Number(item.value || 0), 0);
  const dateLabel = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-5 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Visão Geral</h1>
          <p className="text-slate-500 text-sm">Painel consolidado de operação municipal e estadual</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <Calendar className="w-4 h-4" />
            {dateLabel}
          </div>
          <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
            <TrendingUp className="w-4 h-4" />
            Base operacional: {totalBase}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <button
            key={index} 
            onClick={() => navigate(stat.path)}
            className="text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide font-semibold text-slate-500">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">Clique para abrir módulo</p>
              </div>
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} text-white flex items-center justify-center shadow-sm`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-medium">
              <span className="text-emerald-600 inline-flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                Acompanhamento
              </span>
              <span className="text-slate-400">Tempo real</span>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Atividades Recentes
          </h3>
          <div className="space-y-3">
            {data.recentActivities.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">Nenhuma atividade recente.</p>
            ) : (
              data.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50/70">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                    {(activity.tecnico_nome || 'T').charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">Visita técnica realizada</p>
                    <p className="text-xs text-slate-500">{activity.tecnico_nome || 'Sem técnico'} • {activity.produtor_nome}</p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {activity.created_at ? new Date(activity.created_at).toLocaleDateString() : '-'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-violet-600" />
              Distribuição Geral
            </h3>
            <div className="space-y-3">
              {stats.map((stat) => {
                const percent = totalBase ? Math.round((Number(stat.value || 0) / totalBase) * 100) : 0;
                return (
                  <div key={stat.label}>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>{stat.label.replace('Total ', '')}</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${stat.color}`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-cyan-600" />
              Acesso Rápido
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => navigate('/secretaria')} className="px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-sm text-slate-700 text-left">Secretaria</button>
              <button onClick={() => navigate('/produtores')} className="px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-sm text-slate-700 text-left">Produtores</button>
              <button onClick={() => navigate('/propriedades')} className="px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-sm text-slate-700 text-left">Propriedades</button>
              <button onClick={() => navigate('/atendimentos')} className="px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-sm text-slate-700 text-left">Atendimentos</button>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Tractor className="w-5 h-5 text-orange-600" />
              Máquinas Disponíveis
            </h3>
            <p className="text-sm text-slate-600">
              Total no cadastro atual: <span className="font-semibold text-slate-900">{data.stats.maquinas}</span>
            </p>
            <button onClick={() => navigate('/recursos')} className="mt-3 w-full px-3 py-2 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 text-sm font-medium">
              Abrir recursos e máquinas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
