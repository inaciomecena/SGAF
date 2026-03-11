import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { canAccessPmaf, canAccessSim, canManageUsers } from '../utils/roles';
import { 
  Menu, Home, Users, Sprout, Tractor, Car,
  ClipboardList, LogOut, FileText, Building2, TableProperties, ChevronDown
} from 'lucide-react';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [tabelasExpanded, setTabelasExpanded] = useState(location.pathname.startsWith('/tabelas'));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Produtores', path: '/produtores' },
    { icon: Sprout, label: 'Propriedades', path: '/propriedades' },
    { icon: ClipboardList, label: 'Atendimentos', path: '/atendimentos' },
    { icon: Tractor, label: 'Recursos & Máquinas', path: '/recursos' },
    { icon: Car, label: 'Frota', path: '/frota' },
    { icon: FileText, label: 'Relatórios', path: '/relatorios' },
    { icon: Building2, label: 'Meus Dados', path: '/meus-dados' },
    { icon: FileText, label: 'SIM', path: '/sim', simOnly: true },
    { icon: FileText, label: 'PMAF', path: '/pmaf', pmafOnly: true },
    { icon: Building2, label: 'SECRETARIA', path: '/secretaria', adminOnly: true },
  ];

  const tabelasOpen = location.pathname.startsWith('/tabelas');

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <span className="text-lg font-bold text-white tracking-wide">SAF</span>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              if (item.adminOnly && !canManageUsers(user?.perfil)) return null;
              if (item.pmafOnly && !canAccessPmaf(user?.perfil)) return null;
              if (item.simOnly && !canAccessSim(user?.perfil)) return null;
              
              const isActive = item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-slate-700 text-white' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}

            <div className="mt-2">
              <button
                type="button"
                onClick={() => setTabelasExpanded((prev) => !prev)}
                className={`
                  w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors
                  ${tabelasOpen || tabelasExpanded ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <div className="flex items-center">
                  <TableProperties className={`w-5 h-5 mr-3 ${tabelasOpen || tabelasExpanded ? 'text-cyan-300' : 'text-slate-400'}`} />
                  Tabela
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${tabelasExpanded ? 'rotate-180 text-cyan-300' : 'text-slate-400'}`} />
              </button>
              {tabelasExpanded && (
                <div className="mt-1 ml-6 space-y-1">
                  <Link
                    to="/tabelas/culturas"
                    className={`
                      flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors
                      ${location.pathname.startsWith('/tabelas/culturas')
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    Culturas
                  </Link>
                </div>
              )}
            </div>
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center mb-4 px-2">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs mr-3">
                {user?.nome?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-100 truncate">{user?.nome}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2 text-sm text-rose-200 hover:bg-rose-500/20 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 lg:px-8 justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <p className="text-sm text-slate-500">Sistema Agricultura Familiar</p>
              <p className="text-base font-semibold text-slate-800">Painel de Controle</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">{user?.nome}</p>
              <p className="text-xs text-slate-500">{user?.perfil}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 text-sm font-bold">
              {user?.nome?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
