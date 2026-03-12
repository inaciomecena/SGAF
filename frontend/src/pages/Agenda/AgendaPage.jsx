import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Tractor, ChevronLeft, ChevronRight, Plus, Trash2, Edit2, FileText } from 'lucide-react';
import recursoService from '../../services/recursoService';
import atendimentoService from '../../services/atendimentoService';
import api from '../../services/api';
import produtorService from '../../services/produtorService';

export default function AgendaPage() {
  const navigate = useNavigate();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-11
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tecnicos, setTecnicos] = useState([]);
  const [selectedTecnicoId, setSelectedTecnicoId] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [maquinas, setMaquinas] = useState([]);
  const [produtores, setProdutores] = useState([]);
  const [selectedDayDate, setSelectedDayDate] = useState(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);

  const monthLabel = useMemo(() => {
    return new Date(currentYear, currentMonth).toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    });
  }, [currentYear, currentMonth]);

  const toLocalDateKey = useCallback((date) => {
    const d = date instanceof Date ? date : new Date(date);
    const pad2 = (value) => String(value).padStart(2, '0');
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }, []);

  const toDatetimeLocal = useCallback((value) => {
    if (!value) return null;
    const d = value instanceof Date ? value : new Date(value);
    if (!Number.isFinite(d.getTime())) return null;
    const pad2 = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  }, []);

  const loadTecnicos = async () => {
    try {
      const response = await api.get('/ater/tecnicos');
      setTecnicos(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar técnicos:', error);
    }
  };

  const loadMaquinasEProdutores = async () => {
    try {
      const [maquinasResp, produtoresResp] = await Promise.all([
        recursoService.listarMaquinas(),
        produtorService.listar()
      ]);
      setMaquinas(maquinasResp || []);
      setProdutores(produtoresResp || []);
    } catch (error) {
      console.error('Erro ao carregar máquinas/produtores:', error);
    }
  };

  const loadAgendamentos = async () => {
    setLoading(true);
    try {
      const params = {
        ano: currentYear,
        mes: currentMonth + 1
      };
      if (selectedTecnicoId) {
        params.tecnicoId = selectedTecnicoId;
      }
      const data = await recursoService.listarAgendamentos(params);
      setAgendamentos(data || []);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTecnicos();
    loadMaquinasEProdutores();
  }, []);

  useEffect(() => {
    loadAgendamentos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYear, currentMonth, selectedTecnicoId]);

  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 0) {
        setCurrentYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 11) {
        setCurrentYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  const monthMatrix = useMemo(() => {
    const start = new Date(currentYear, currentMonth, 1);
    const firstDayOfWeek = start.getDay(); // 0-6
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const weeks = [];
    let currentDay = 1 - firstDayOfWeek;

    for (let week = 0; week < 6; week++) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(currentYear, currentMonth, currentDay);
        const inCurrentMonth = currentDay >= 1 && currentDay <= daysInMonth;
        days.push({ date, inCurrentMonth });
        currentDay++;
      }
      weeks.push(days);
    }
    return weeks;
  }, [currentYear, currentMonth]);

  const eventsByDay = useMemo(() => {
    const map = {};
    for (const a of agendamentos) {
      if (!a.data_inicio) continue;
      const d = new Date(a.data_inicio);
      const key = toLocalDateKey(d);
      if (!map[key]) map[key] = [];
      map[key].push(a);
    }
    return map;
  }, [agendamentos, toLocalDateKey]);

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const handleOpenNew = (date) => {
    setSelectedEvent({
      id: null,
      data_inicio: date.toISOString().slice(0, 16),
      data_fim: '',
      maquina_id: '',
      produtor_id: '',
      operador_id: '',
      tecnico_id: '',
      atendimento_id: '',
      titulo: '',
      descricao: '',
      tipo: 'MAQUINA'
    });
  };

  const handleEdit = (event) => {
    setSelectedEvent({
      ...event,
      data_inicio: event.data_inicio ? event.data_inicio.slice(0, 16) : '',
      data_fim: event.data_fim ? event.data_fim.slice(0, 16) : ''
    });
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  const handleChangeField = (field, value) => {
    setSelectedEvent((prev) => ({ ...prev, [field]: value }));
  };

  const handleOpenDay = (date) => {
    setSelectedDayDate(date);
    setIsDayModalOpen(true);
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    const key = toLocalDateKey(date);
    return eventsByDay[key] || [];
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;

    if (!selectedEvent.data_inicio) {
      window.alert('Informe a data e hora de início.');
      return;
    }

    // Para tipo MAQUINA exigimos máquina; para VISITA/COMPROMISSO é opcional.
    if (selectedEvent.tipo === 'MAQUINA' && !selectedEvent.maquina_id) {
      window.alert('Selecione a máquina/recurso para este agendamento.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        maquina_id: selectedEvent.maquina_id || null,
        produtor_id: selectedEvent.produtor_id || null,
        operador_id: selectedEvent.operador_id || null,
        tecnico_id: selectedEvent.tecnico_id || null,
        atendimento_id: selectedEvent.atendimento_id || null,
        data_inicio: selectedEvent.data_inicio || null,
        data_fim: selectedEvent.data_fim || null,
        titulo: selectedEvent.titulo || null,
        descricao: selectedEvent.descricao || null,
        tipo: selectedEvent.tipo || 'MAQUINA'
      };

      if (payload.atendimento_id) {
        try {
          const atendimento = await atendimentoService.detalhar(payload.atendimento_id);
          const novoInicio = toDatetimeLocal(atendimento?.data_atendimento);
          if (novoInicio && payload.data_inicio && novoInicio !== payload.data_inicio) {
            let duracaoMs = null;
            if (payload.data_fim) {
              const start = new Date(payload.data_inicio);
              const end = new Date(payload.data_fim);
              if (Number.isFinite(start.getTime()) && Number.isFinite(end.getTime())) {
                const diff = end.getTime() - start.getTime();
                if (diff > 0) {
                  duracaoMs = diff;
                }
              }
            }

            payload.data_inicio = novoInicio;
            if (duracaoMs) {
              const novoFim = toDatetimeLocal(new Date(new Date(novoInicio).getTime() + duracaoMs));
              if (novoFim) {
                payload.data_fim = novoFim;
              }
            }
          }
        } catch (error) {
          void error;
        }
      }

      if (selectedEvent.id) {
        await recursoService.atualizarAgendamento(selectedEvent.id, payload);
        await loadAgendamentos();
        handleCloseModal();
      } else {
        const gerarAtendimento =
          selectedEvent.tipo === 'VISITA' &&
          !selectedEvent.atendimento_id &&
          window.confirm('Deseja gerar o atendimento desta visita técnica agora?');

        const criado = await recursoService.criarAgendamento(payload);
        const agendamentoId = criado?.id;

        await loadAgendamentos();
        handleCloseModal();

        if (gerarAtendimento && agendamentoId) {
          navigate('/atendimentos/novo', {
            state: {
              fromAgenda: true,
              agendamentoId,
              data_inicio: selectedEvent.data_inicio,
              data_fim: selectedEvent.data_fim || null,
              tecnico_id: selectedEvent.tecnico_id || null,
              produtor_id: selectedEvent.produtor_id || null,
              motivo: selectedEvent.titulo || 'Visita técnica',
              observacoes: selectedEvent.descricao || ''
            }
          });
        }
      }
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      const message = error?.response?.data?.message || 'Erro ao salvar agendamento';
      window.alert(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent?.id) return;
    if (!window.confirm('Deseja realmente remover este agendamento?')) return;
    setIsSaving(true);
    try {
      await recursoService.removerAgendamento(selectedEvent.id);
      await loadAgendamentos();
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao remover agendamento:', error);
      const message = error?.response?.data?.message || 'Erro ao remover agendamento';
      window.alert(message);
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleMarkDone = async (event) => {
    const atual = event.descricao || '';
    if (atual.includes('[CONCLUÍDO]')) {
      return;
    }
    const novaDescricao = `[CONCLUÍDO] ${atual}`.trim();
    try {
      await recursoService.atualizarAgendamento(event.id, { descricao: novaDescricao });
      await loadAgendamentos();
    } catch (error) {
      console.error('Erro ao marcar como concluído:', error);
      window.alert('Erro ao marcar compromisso como concluído.');
    }
  };

  const handlePostponeOneDay = async (event) => {
    if (!window.confirm('Deseja adiar este compromisso em 1 dia?')) return;
    try {
      const start = event.data_inicio ? new Date(event.data_inicio) : new Date();
      start.setDate(start.getDate() + 1);
      const payload = {
        data_inicio: start.toISOString()
      };
      if (event.data_fim) {
        const end = new Date(event.data_fim);
        end.setDate(end.getDate() + 1);
        payload.data_fim = end.toISOString();
      }
      await recursoService.atualizarAgendamento(event.id, payload);
      await loadAgendamentos();
    } catch (error) {
      console.error('Erro ao adiar compromisso:', error);
      window.alert('Erro ao adiar compromisso.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-600" />
            Agenda de Atividades
          </h1>
          <p className="text-slate-500 text-sm">
            Controle de agendamentos de visitas, compromissos e uso de máquinas em visão mensal.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="border border-slate-300 rounded-lg text-sm px-2 py-1.5 bg-white"
            value={selectedTecnicoId}
            onChange={(e) => setSelectedTecnicoId(e.target.value)}
          >
            <option value="">Todos os técnicos</option>
            {tecnicos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={goToToday}
            className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Hoje
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-800 capitalize">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={goToNextMonth}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm text-slate-500">
            {loading ? 'Carregando...' : `${agendamentos.length} agendamentos no mês`}
          </span>
        </div>

        <div className="px-4 py-2 grid grid-cols-7 gap-2 text-xs font-medium text-slate-500">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
            <div key={d} className="text-center">
              {d}
            </div>
          ))}
        </div>

        <div className="px-4 pb-4 grid grid-rows-6 grid-cols-7 gap-2">
          {monthMatrix.map((week, wi) =>
            week.map(({ date, inCurrentMonth }, di) => {
              const key = toLocalDateKey(date);
              const events = eventsByDay[key] || [];
              const isToday = isSameDay(date, today);
              const iconForTipo = (tipo) => {
                if (tipo === 'MAQUINA') return Tractor;
                if (tipo === 'VISITA') return User;
                return FileText;
              };
              return (
                <button
                  key={`${wi}-${di}`}
                  type="button"
                  className={`min-h-[88px] rounded-xl border px-2 py-1 flex flex-col items-stretch text-left transition-colors ${
                    inCurrentMonth
                      ? 'bg-slate-50/60 border-slate-100 hover:bg-slate-100'
                      : 'bg-white border-slate-50 text-slate-300'
                  }`}
                  onClick={() => inCurrentMonth && handleOpenDay(date)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs ${
                        inCurrentMonth ? 'text-slate-700' : 'text-slate-300'
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    {isToday && (
                      <span className="text-[9px] px-1 rounded-full bg-emerald-100 text-emerald-700">
                        hoje
                      </span>
                    )}
                  </div>
                  <div className="flex-1 space-y-0.5 overflow-hidden">
                    {events.slice(0, 3).map((ev) => {
                      const concluido = (ev.descricao || '').includes('[CONCLUÍDO]');
                      const Icon = iconForTipo(ev.tipo);
                      return (
                        <div
                          key={ev.id}
                          className={`text-[10px] px-1 py-0.5 rounded cursor-pointer truncate flex items-center gap-1 ${
                            concluido
                              ? 'bg-emerald-200 text-emerald-900 line-through'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(ev);
                          }}
                        >
                          <Icon className="w-3 h-3" />
                          <span className="truncate">
                            {formatTime(ev.data_inicio)}{' '}
                            {ev.titulo || ev.maquina_nome || 'Agendamento'}
                          </span>
                        </div>
                      );
                    })}
                    {events.length > 3 && (
                      <div className="text-[10px] text-slate-400">
                        +{events.length - 3} agend.
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {selectedDayDate && isDayModalOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-slate-800">
                Compromissos em{' '}
                {selectedDayDate.toLocaleDateString('pt-BR', {
                  weekday: 'short',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </h2>
              <button
                type="button"
                onClick={() => setIsDayModalOpen(false)}
                className="text-slate-500 hover:text-slate-700 text-sm"
              >
                Fechar
              </button>
            </div>
            <div className="space-y-2 max-h-[320px] overflow-y-auto">
              {getEventsForDate(selectedDayDate).length === 0 ? (
                <p className="text-sm text-slate-500">
                  Nenhum compromisso neste dia.
                </p>
              ) : (
                getEventsForDate(selectedDayDate).map((ev) => {
                  const concluido = (ev.descricao || '').includes('[CONCLUÍDO]');
                  const iconForTipo = (tipo) => {
                    if (tipo === 'MAQUINA') return Tractor;
                    if (tipo === 'VISITA') return User;
                    return FileText;
                  };
                  const Icon = iconForTipo(ev.tipo);
                  return (
                    <div
                      key={ev.id}
                      className="border border-slate-200 rounded-lg p-3 flex flex-col gap-2 bg-slate-50/60"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {ev.titulo || ev.maquina_nome || 'Agendamento'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatTime(ev.data_inicio)}{' '}
                            {ev.produtor_nome && `• ${ev.produtor_nome}`}
                          </p>
                        </div>
                        {concluido && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                            Concluído
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Icon className="w-3 h-3" />
                        <span>
                          {ev.tipo === 'MAQUINA'
                            ? 'Máquina / Recurso'
                            : ev.tipo === 'VISITA'
                              ? 'Visita técnica'
                              : 'Compromisso'}
                        </span>
                        {ev.atendimento_id ? (
                          <button
                            type="button"
                            onClick={() => navigate(`/atendimentos/${ev.atendimento_id}`)}
                            className="ml-auto text-slate-700 hover:text-slate-900"
                          >
                            Abrir atendimento #{ev.atendimento_id}
                          </button>
                        ) : null}
                      </div>
                      {ev.descricao && (
                        <p className="text-xs text-slate-600">
                          {ev.descricao}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setIsDayModalOpen(false);
                            handleEdit(ev);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200"
                        >
                          <Edit2 className="w-3 h-3" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePostponeOneDay(ev)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100"
                        >
                          <Clock className="w-3 h-3" />
                          Adiar 1 dia
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMarkDone(ev)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        >
                          Concluir
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsDayModalOpen(false);
                  handleOpenNew(selectedDayDate);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4" />
                Novo compromisso neste dia
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedEvent && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                {selectedEvent.id ? 'Editar agendamento' : 'Novo agendamento'}
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-slate-500 hover:text-slate-700 text-sm"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Tipo
                  </label>
                  <select
                    className="w-full border border-slate-300 rounded-lg text-sm px-2 py-1.5"
                    value={selectedEvent.tipo}
                    onChange={(e) => handleChangeField('tipo', e.target.value)}
                  >
                    <option value="MAQUINA">Máquina / Recurso</option>
                    <option value="VISITA">Visita técnica</option>
                    <option value="COMPROMISSO">Compromisso</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Técnico
                  </label>
                  <select
                    className="w-full border border-slate-300 rounded-lg text-sm px-2 py-1.5"
                    value={selectedEvent.tecnico_id || ''}
                    onChange={(e) => handleChangeField('tecnico_id', e.target.value || null)}
                  >
                    <option value="">Selecione</option>
                    {tecnicos.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Máquina / Recurso
                  </label>
                  <select
                    className="w-full border border-slate-300 rounded-lg text-sm px-2 py-1.5"
                    value={selectedEvent.maquina_id || ''}
                    onChange={(e) => handleChangeField('maquina_id', e.target.value || null)}
                  >
                    <option value="">Selecione</option>
                    {maquinas.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Produtor
                  </label>
                  <select
                    className="w-full border border-slate-300 rounded-lg text-sm px-2 py-1.5"
                    value={selectedEvent.produtor_id || ''}
                    onChange={(e) => handleChangeField('produtor_id', e.target.value || null)}
                  >
                    <option value="">Selecione</option>
                    {produtores.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-300 rounded-lg text-sm px-2 py-1.5"
                  value={selectedEvent.titulo || ''}
                  onChange={(e) => handleChangeField('titulo', e.target.value)}
                  placeholder="Ex.: Visita técnica, manutenção, reunião..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Início
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full border border-slate-300 rounded-lg text-sm px-2 py-1.5"
                    value={selectedEvent.data_inicio || ''}
                    onChange={(e) => handleChangeField('data_inicio', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Fim
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full border border-slate-300 rounded-lg text-sm px-2 py-1.5"
                    value={selectedEvent.data_fim || ''}
                    onChange={(e) => handleChangeField('data_fim', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Atendimento vinculado
                </label>
                {selectedEvent.atendimento_id ? (
                  <button
                    type="button"
                    onClick={() => navigate(`/atendimentos/${selectedEvent.atendimento_id}`)}
                    className="w-full text-left border border-slate-300 rounded-lg text-sm px-3 py-2 hover:bg-slate-50"
                  >
                    Abrir atendimento #{selectedEvent.atendimento_id}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="text-xs text-slate-500">
                      Nenhum atendimento vinculado.
                    </div>
                    <input
                      type="number"
                      className="w-full border border-slate-300 rounded-lg text-sm px-2 py-1.5"
                      value={selectedEvent.atendimento_id || ''}
                      onChange={(e) => handleChangeField('atendimento_id', e.target.value || null)}
                      placeholder="Opcional: informe o ID do atendimento"
                    />
                    {selectedEvent.tipo === 'VISITA' && !selectedEvent.id ? (
                      <div className="text-xs text-slate-500">
                        Ao salvar, será perguntado se deseja gerar o atendimento automaticamente.
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Descrição / Observações
                </label>
                <textarea
                  className="w-full border border-slate-300 rounded-lg text-sm px-2 py-1.5 min-h-[72px]"
                  value={selectedEvent.descricao || ''}
                  onChange={(e) => handleChangeField('descricao', e.target.value)}
                  placeholder="Detalhes da visita, compromisso ou uso de máquina."
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                {selectedEvent.id ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="inline-flex items-center gap-1 text-sm text-rose-600 hover:text-rose-700"
                    disabled={isSaving}
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50"
                    disabled={isSaving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium flex items-center gap-1 hover:bg-emerald-700 disabled:opacity-60"
                    disabled={isSaving}
                  >
                    {selectedEvent.id ? (
                      <>
                        <Edit2 className="w-4 h-4" />
                        Salvar
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Criar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
