import React, { useCallback, useEffect, useState } from 'react';
import { Users, Sprout, Tractor, ClipboardList, TrendingUp, Calendar, ArrowUpRight, BarChart3, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../../services/dashboardService';
import recursoService from '../../services/recursoService';

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
  const [monthlyAgenda, setMonthlyAgenda] = useState([]);
  const [agendaMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
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

  const loadMonthlyAgenda = useCallback(async () => {
    try {
      const all = await recursoService.listarAgendamentos({
        ano: agendaMonth.year,
        mes: agendaMonth.month + 1
      });
      setMonthlyAgenda(all || []);
    } catch (error) {
      console.error('Erro ao carregar agenda do mês:', error);
    }
  }, [agendaMonth.year, agendaMonth.month]);

  useEffect(() => {
    loadMonthlyAgenda();
  }, [loadMonthlyAgenda]);

  const monthMatrix = (() => {
    const { year, month } = agendaMonth;
    const start = new Date(year, month, 1);
    const firstDayOfWeek = start.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const weeks = [];
    let currentDay = 1 - firstDayOfWeek;

    for (let week = 0; week < 6; week++) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(year, month, currentDay);
        const inCurrentMonth = currentDay >= 1 && currentDay <= daysInMonth;
        days.push({ date, inCurrentMonth });
        currentDay++;
      }
      weeks.push(days);
    }
    return weeks;
  })();

  const eventsByDay = (() => {
    const map = {};
    for (const a of monthlyAgenda) {
      if (!a.data_inicio) continue;
      const d = new Date(a.data_inicio);
      const key = d.toISOString().slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(a);
    }
    return map;
  })();

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const agendaMonthLabel = new Date(
    agendaMonth.year,
    agendaMonth.month
  ).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

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
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-800">
                  Agenda do Mês
                </h3>
                <span className="text-xs text-slate-500 capitalize">
                  {agendaMonthLabel}
                </span>
              </div>
              <button
                onClick={() => navigate('/agenda')}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-medium"
              >
                Ver agenda completa
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-[11px] text-slate-500 mb-2">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d) => (
                <div key={d} className="text-center">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-rows-6 grid-cols-7 gap-1">
              {monthMatrix.map((week, wi) =>
                week.map(({ date, inCurrentMonth }, di) => {
                  const key = date.toISOString().slice(0, 10);
                  const items = eventsByDay[key] || [];
                  const today = new Date();
                  const isToday = isSameDay(date, today);
                  return (
                    <div
                      key={`${wi}-${di}`}
                      className={`min-h-[40px] rounded-md border px-1.5 py-0.5 flex flex-col ${
                        inCurrentMonth
                          ? 'bg-slate-50/60 border-slate-100'
                          : 'bg-white border-slate-50 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span
                          className={`text-[10px] ${
                            inCurrentMonth ? 'text-slate-700' : 'text-slate-300'
                          }`}
                        >
                          {date.getDate()}
                        </span>
                        {isToday && (
                          <span className="text-[8px] px-1 rounded-full bg-emerald-100 text-emerald-700">
                            hoje
                          </span>
                        )}
                      </div>
                      <div className="space-y-0.5 overflow-hidden">
                        {items.slice(0, 2).map((a) => (
                          <div
                            key={a.id}
                            className="text-[9px] px-1 py-0.5 rounded bg-emerald-100 text-emerald-800 truncate"
                            title={`${a.maquina_nome || 'Recurso'} - ${a.produtor_nome || ''}`}
                          >
                            {a.maquina_nome || 'Recurso'}
                          </div>
                        ))}
                        {items.length > 2 && (
                          <div className="text-[9px] text-slate-400">
                            +{items.length - 2} agend.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
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
