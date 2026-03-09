import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, ImagePlus, Loader2, MapPin, Trash2, Upload, Car } from 'lucide-react';
import atendimentoService from '../../services/atendimentoService';

export default function AtendimentoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [atendimento, setAtendimento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [erro, setErro] = useState('');
  const [arquivos, setArquivos] = useState([]);

  const fotos = atendimento?.fotos || [];
  const dataAtendimento = atendimento?.data_atendimento
    ? new Date(atendimento.data_atendimento).toLocaleDateString()
    : '-';

  const descricaoPartes = useMemo(() => {
    const texto = atendimento?.descricao || '';
    if (!texto) {
      return { motivo: '-', observacoes: '-', recomendacoes: '-' };
    }
    const partes = texto.split(' | ');
    return {
      motivo: partes[0] || '-',
      observacoes: partes[1] || '-',
      recomendacoes: partes.slice(2).join(' | ') || '-'
    };
  }, [atendimento?.descricao]);

  const carregar = useCallback(async () => {
    try {
      setErro('');
      const data = await atendimentoService.detalhar(id);
      setAtendimento(data);
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao carregar atendimento');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleSelecionarArquivos = (event) => {
    const lista = Array.from(event.target.files || []);
    setArquivos(lista);
  };

  const handleEnviarFotos = async () => {
    if (!arquivos.length) {
      return;
    }
    setUploading(true);
    setErro('');
    try {
      const atualizado = await atendimentoService.anexarFotos(id, arquivos);
      setAtendimento(atualizado);
      setArquivos([]);
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao enviar fotos');
    } finally {
      setUploading(false);
    }
  };

  const handleExcluirFoto = async (fotoId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta foto?')) {
      return;
    }
    setDeleting(fotoId);
    setErro('');
    try {
      await atendimentoService.removerFoto(fotoId);
      // Atualiza a lista de fotos removendo a excluída localmente ou recarregando
      const novasFotos = atendimento.fotos.filter(f => f.id !== fotoId);
      setAtendimento(prev => ({ ...prev, fotos: novasFotos }));
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao excluir foto');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 flex items-center justify-center gap-2 text-slate-600">
        <Loader2 className="w-5 h-5 animate-spin" />
        Carregando atendimento...
      </div>
    );
  }

  if (erro && !atendimento) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/atendimentos')}
          className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <div className="bg-rose-50 text-rose-700 border border-rose-200 rounded-xl p-4">{erro}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/atendimentos')}
          className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para atendimentos
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">Produtor</p>
          <p className="text-base font-semibold text-slate-800">{atendimento?.produtor_nome || '-'}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">Técnico</p>
          <p className="text-base font-semibold text-slate-800">{atendimento?.tecnico_nome || '-'}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">Data</p>
          <p className="text-base font-semibold text-slate-800">{dataAtendimento}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">Município (IBGE)</p>
          <p className="text-base font-semibold text-slate-800">{atendimento?.codigo_ibge || '-'}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Motivo</p>
          <p className="text-slate-800">{descricaoPartes.motivo}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Observações</p>
          <p className="text-slate-700 whitespace-pre-wrap">{descricaoPartes.observacoes}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Recomendações técnicas</p>
          <p className="text-slate-700 whitespace-pre-wrap">{descricaoPartes.recomendacoes}</p>
        </div>
        <div className="md:col-span-2 flex items-center gap-4 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            Lat: {atendimento?.latitude ?? '-'}
          </span>
          <span>Lng: {atendimento?.longitude ?? '-'}</span>
        </div>

        {atendimento?.transporte && (
          <div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2">
            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Car className="w-4 h-4 text-slate-500" />
              Deslocamento
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 rounded-lg p-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Veículo</p>
                <p className="font-medium text-slate-700">
                  {atendimento.transporte.modelo} - {atendimento.transporte.placa}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">KM Percorrido</p>
                <p className="font-medium text-slate-700">
                  {atendimento.transporte.km_percorrido} km
                </p>
              </div>
              <div className="text-xs text-slate-500">
                <p>Saída: {atendimento.transporte.km_saida}</p>
                <p>Chegada: {atendimento.transporte.km_chegada}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-800">Fotos do atendimento</h2>
          <span className="text-sm text-slate-500">{fotos.length} fotos</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {fotos.length ? fotos.map((foto) => (
            <div key={foto.id} className="relative group border border-slate-200 bg-slate-100 rounded-xl overflow-hidden">
              <a
                href={atendimentoService.getFotoUrl(foto.arquivo)}
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                <img
                  src={atendimentoService.getFotoUrl(foto.arquivo)}
                  alt={`Foto ${foto.id}`}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </a>
              <button
                onClick={() => handleExcluirFoto(foto.id)}
                disabled={deleting === foto.id}
                className="absolute top-2 right-2 p-2 bg-white/90 text-rose-600 rounded-full shadow-sm hover:bg-rose-50 disabled:opacity-50 transition-colors"
                title="Excluir foto"
              >
                {deleting === foto.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          )) : (
            <div className="col-span-full text-sm text-slate-500 bg-slate-50 border border-dashed border-slate-300 rounded-xl p-6 text-center">
              Nenhuma foto anexada neste atendimento.
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 pt-4 space-y-3">
          <p className="text-sm text-slate-700">Anexar fotos da galeria ou tirar foto agora</p>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer">
              <ImagePlus className="w-4 h-4" />
              Selecionar arquivos
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleSelecionarArquivos}
                className="hidden"
              />
            </label>
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer">
              <Camera className="w-4 h-4" />
              Tirar foto
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleSelecionarArquivos}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={handleEnviarFotos}
              disabled={!arquivos.length || uploading}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white px-4 py-2 rounded-lg"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Enviar {arquivos.length ? `(${arquivos.length})` : ''}
            </button>
          </div>
          {!!arquivos.length && (
            <p className="text-xs text-slate-500">{arquivos.length} arquivo(s) selecionado(s)</p>
          )}
          {!!erro && (
            <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3">{erro}</div>
          )}
        </div>
      </div>
    </div>
  );
}
