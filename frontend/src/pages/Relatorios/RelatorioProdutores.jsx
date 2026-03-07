import React, { useState, useEffect } from 'react';
import { Printer, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import produtorService from '../../services/produtorService';

export default function RelatorioProdutores() {
  const navigate = useNavigate();
  const [produtores, setProdutores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await produtorService.listar();
      setProdutores(data);
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
          <h1 className="text-2xl font-bold text-gray-900">Relatório de Produtores</h1>
          <p className="text-gray-500 text-sm mt-1">
            Emitido em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
          </p>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="py-2 text-sm font-bold text-gray-700">Nome</th>
              <th className="py-2 text-sm font-bold text-gray-700">CPF</th>
              <th className="py-2 text-sm font-bold text-gray-700">Telefone</th>
              <th className="py-2 text-sm font-bold text-gray-700">Localidade</th>
            </tr>
          </thead>
          <tbody>
            {produtores.map((produtor) => (
              <tr key={produtor.id} className="border-b border-gray-100 text-sm">
                <td className="py-2">{produtor.nome}</td>
                <td className="py-2">{produtor.cpf}</td>
                <td className="py-2">{produtor.telefone || '-'}</td>
                <td className="py-2">{produtor.bairro || produtor.comunidade || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="mt-8 text-xs text-gray-400 text-center print:fixed print:bottom-4 print:left-0 print:w-full">
          Sistema de Gestão da Agricultura Familiar - SGAF
        </div>
      </div>
    </div>
  );
}
