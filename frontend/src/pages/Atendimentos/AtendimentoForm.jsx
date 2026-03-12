import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Calendar, FileText, Car } from 'lucide-react';
import atendimentoService from '../../services/atendimentoService';
import produtorService from '../../services/produtorService';
import propriedadeService from '../../services/propriedadeService';
import frotaService from '../../services/frotaService';
import recursoService from '../../services/recursoService';
import { useAuth } from '../../contexts/useAuth';
import { normalizeRole } from '../../utils/roles';

export default function AtendimentoForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [produtores, setProdutores] = useState([]);
  const [propriedades, setPropriedades] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [agendaPrefillApplied, setAgendaPrefillApplied] = useState(false);
  
  const [formData, setFormData] = useState(() => {
    const now = new Date();
    const pad2 = (value) => String(value).padStart(2, '0');
    return {
      tecnico_id: '',
      produtor_id: '',
      propriedade_id: '',
      data_visita: now.toISOString().split('T')[0],
      hora_visita: `${pad2(now.getHours())}:${pad2(now.getMinutes())}`,
      motivo: '',
      observacoes: '',
      recomendacoes: '',
      veiculo_id: '',
      km_saida: '',
      km_chegada: ''
    };
  });

  const toDatetimeLocal = (value) => {
    if (!value) return null;
    const d = value instanceof Date ? value : new Date(value);
    if (!Number.isFinite(d.getTime())) return null;
    const pad2 = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  };

  useEffect(() => {
    if (agendaPrefillApplied) return;
    const state = location.state;
    if (!state?.fromAgenda || !state?.agendamentoId) return;

    const dataInicio = String(state?.data_inicio || '');
    const [dataVisita, horaVisita] = dataInicio.includes('T') ? dataInicio.split('T') : [null, null];

    setFormData((prev) => ({
      ...prev,
      tecnico_id: state?.tecnico_id ? String(state.tecnico_id) : prev.tecnico_id,
      produtor_id: state?.produtor_id ? String(state.produtor_id) : prev.produtor_id,
      data_visita: dataVisita || prev.data_visita,
      hora_visita: horaVisita ? horaVisita.slice(0, 5) : prev.hora_visita,
      motivo: state?.motivo ? String(state.motivo) : prev.motivo,
      observacoes: state?.observacoes ? String(state.observacoes) : prev.observacoes
    }));
    setAgendaPrefillApplied(true);
  }, [agendaPrefillApplied, location.state]);

  useEffect(() => {
    loadProdutores();
    loadTecnicos();
    loadVeiculos();
  }, []);

  // Carrega propriedades quando o produtor é selecionado
  useEffect(() => {
    if (formData.produtor_id) {
      loadPropriedades(formData.produtor_id);
    } else {
      setPropriedades([]);
    }
  }, [formData.produtor_id]);

  const loadProdutores = async () => {
    try {
      const data = await produtorService.listar();
      setProdutores(data);
    } catch (error) {
      console.error('Erro ao carregar produtores:', error);
    }
  };

  const loadTecnicos = async () => {
    try {
      const data = await atendimentoService.listarTecnicos();
      setTecnicos(data);
    } catch (error) {
      console.error('Erro ao carregar técnicos:', error);
    }
  };

  const loadVeiculos = async () => {
    try {
      const data = await frotaService.listarVeiculos();
      setVeiculos(data);
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
    }
  };

  const loadPropriedades = async (produtorId) => {
    try {
      const data = await propriedadeService.listarPorProdutor(produtorId);
      setPropriedades(data);
    } catch (error) {
      console.error('Erro ao carregar propriedades:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'veiculo_id') {
      const veiculo = veiculos.find(v => String(v.id) === String(value));
      setFormData(prev => ({
        ...prev,
        [name]: value,
        km_saida: veiculo ? veiculo.odometro_atual : ''
      }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await atendimentoService.registrar(formData);
      const atendimentoId = result?.id;

      const state = location.state;
      if (state?.fromAgenda && state?.agendamentoId && atendimentoId) {
        try {
          let dataInicio = `${formData.data_visita}T${formData.hora_visita}`;

          try {
            const atendimento = await atendimentoService.detalhar(atendimentoId);
            const inicioAtendimento = toDatetimeLocal(atendimento?.data_atendimento);
            if (inicioAtendimento) {
              dataInicio = inicioAtendimento;
            }
          } catch (error) {
            void error;
          }

          const payload = {
            atendimento_id: atendimentoId,
            data_inicio: dataInicio
          };

          if (state?.data_inicio && state?.data_fim) {
            const start = new Date(state.data_inicio);
            const end = new Date(state.data_fim);
            const diff = end.getTime() - start.getTime();
            if (Number.isFinite(diff) && diff > 0) {
              const novoFim = toDatetimeLocal(new Date(new Date(dataInicio).getTime() + diff));
              if (novoFim) {
                payload.data_fim = novoFim;
              }
            }
          }

          await recursoService.atualizarAgendamento(state.agendamentoId, payload);
        } catch (linkError) {
          console.error('Erro ao vincular atendimento ao compromisso:', linkError);
          alert('Atendimento registrado, mas não foi possível vincular à agenda.');
        }
        navigate(`/atendimentos/${atendimentoId}`);
        return;
      }

      navigate('/atendimentos');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao registrar atendimento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tecnicos.length || formData.tecnico_id) {
      return;
    }

    const perfilAtual = normalizeRole(user?.perfil);
    if (perfilAtual !== 'TECNICO') {
      return;
    }

    const tecnicoAtual = tecnicos.find((tecnico) => Number(tecnico.id) === Number(user?.id));
    if (!tecnicoAtual) {
      return;
    }

    setFormData((prev) => ({ ...prev, tecnico_id: String(tecnicoAtual.id) }));
  }, [tecnicos, formData.tecnico_id, user?.id, user?.perfil]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/atendimentos')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Registrar Atendimento</h1>
          <p className="text-sm text-gray-500">Nova visita técnica ou assistência</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Técnico responsável *</label>
            <select
              name="tecnico_id"
              required
              value={formData.tecnico_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">Selecione...</option>
              {tecnicos.map((tecnico) => (
                <option key={tecnico.id} value={tecnico.id}>{tecnico.nome}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Produtor *</label>
            <select
              name="produtor_id"
              required
              value={formData.produtor_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">Selecione...</option>
              {produtores.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Propriedade</label>
            <select
              name="propriedade_id"
              value={formData.propriedade_id}
              onChange={handleChange}
              disabled={!formData.produtor_id}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-gray-50"
            >
              <option value="">Selecione (Opcional)...</option>
              {propriedades.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Data da Visita *</label>
            <input
              type="date"
              name="data_visita"
              required
              value={formData.data_visita}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Hora da Visita *</label>
            <input
              type="time"
              name="hora_visita"
              required
              value={formData.hora_visita}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Motivo da Visita *</label>
            <input
              type="text"
              name="motivo"
              required
              value={formData.motivo}
              onChange={handleChange}
              placeholder="Ex: Análise de solo, Pragas, etc."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="md:col-span-2 border-t pt-4 mt-2">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
              <Car className="w-5 h-5 text-gray-500" />
              Deslocamento (Opcional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Veículo Utilizado</label>
                <select
                  name="veiculo_id"
                  value={formData.veiculo_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">Nenhum</option>
                  {veiculos.map(v => (
                    <option key={v.id} value={v.id}>{v.modelo} - {v.placa}</option>
                  ))}
                </select>
              </div>
              
              {formData.veiculo_id && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">KM Saída</label>
                    <input
                      type="number"
                      name="km_saida"
                      value={formData.km_saida}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">KM Chegada (pode informar depois)</label>
                    <input
                      type="number"
                      name="km_chegada"
                      value={formData.km_chegada}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-700">Observações</label>
            <textarea
              name="observacoes"
              rows="3"
              value={formData.observacoes}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Descreva o que foi observado..."
            ></textarea>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-700">Recomendações Técnicas</label>
            <textarea
              name="recomendacoes"
              rows="4"
              value={formData.recomendacoes}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Orientações passadas ao produtor..."
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-70 shadow-sm"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Registrar Atendimento
          </button>
        </div>
      </form>
    </div>
  );
}
