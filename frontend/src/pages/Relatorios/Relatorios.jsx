import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Sprout, ClipboardList, FileText, Printer } from 'lucide-react';

export default function Relatorios() {
  const navigate = useNavigate();

  const reports = [
    {
      title: 'Lista de Produtores',
      description: 'Relatório completo com dados de contato e endereço dos produtores cadastrados.',
      icon: Users,
      color: 'bg-blue-500',
      path: '/relatorios/produtores'
    },
    {
      title: 'Lista de Propriedades',
      description: 'Relatório das propriedades rurais com área e localização.',
      icon: Sprout,
      color: 'bg-blue-500',
      path: '/relatorios/propriedades'
    },
    {
      title: 'Histórico de Atendimentos',
      description: 'Registro cronológico das visitas técnicas realizadas.',
      icon: ClipboardList,
      color: 'bg-purple-500',
      path: '/relatorios/atendimentos'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Relatórios</h1>
        <p className="text-gray-500 text-sm">Geração de documentos para impressão e controle</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, index) => (
          <div 
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className={`w-12 h-12 rounded-lg ${report.color} bg-opacity-10 flex items-center justify-center mb-4`}>
                <report.icon className={`w-6 h-6 ${report.color.replace('bg-', 'text-')}`} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{report.title}</h3>
              <p className="text-gray-500 text-sm mb-6">{report.description}</p>
            </div>
            
            <button
              onClick={() => navigate(report.path)}
              className="w-full flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Visualizar e Imprimir
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
