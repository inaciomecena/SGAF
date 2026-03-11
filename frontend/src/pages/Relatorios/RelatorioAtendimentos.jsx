import React, { useState, useEffect } from 'react';
import { Printer, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import atendimentoService from '../../services/atendimentoService';

export default function RelatorioAtendimentos() {
  const navigate = useNavigate();
  const [atendimentos, setAtendimentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await atendimentoService.listar();
      setAtendimentos(data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando relatório...</div>;
  }

  return (
    <div className="bg-white min-h-screen p-8 print:p-0">
      {/* Header - Hidden on Print */}
      <div className="flex justify-between items-center mb-8 print:hidden">
        <button 
          onClick={() => navigate('/relatorios')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </button>
        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Printer className="w-5 h-5" />
          Imprimir
        </button>
      </div>

      {/* Report Content */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Histórico de Atendimentos</h1>
          <p className="text-gray-500 text-sm mt-1">
            Emitido em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
          </p>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="py-2 text-sm font-bold text-gray-700">Data</th>
              <th className="py-2 text-sm font-bold text-gray-700">Produtor</th>
              <th className="py-2 text-sm font-bold text-gray-700">Motivo</th>
              <th className="py-2 text-sm font-bold text-gray-700">Técnico</th>
            </tr>
          </thead>
          <tbody>
            {atendimentos.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 text-sm odd:bg-white even:bg-gray-50/70">
                <td className="py-2">{new Date(item.data_visita).toLocaleDateString()}</td>
                <td className="py-2">{item.produtor_nome}</td>
                <td className="py-2">{item.motivo}</td>
                <td className="py-2">{item.tecnico_nome}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="mt-8 text-xs text-gray-400 text-center print:fixed print:bottom-4 print:left-0 print:w-full">
          SAF - Sistema Agricultura Familiar
        </div>
      </div>
    </div>
  );
}
