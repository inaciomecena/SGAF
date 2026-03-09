import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/useAuth';
import { ToastProvider } from './contexts/ToastContext';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';

import UserList from './pages/Users/UserList';
import UserForm from './pages/Users/UserForm';
import ProdutorList from './pages/Produtores/ProdutorList';
import ProdutorForm from './pages/Produtores/ProdutorForm';
import PropriedadeList from './pages/Propriedades/PropriedadeList';
import PropriedadeForm from './pages/Propriedades/PropriedadeForm';
import AtendimentoList from './pages/Atendimentos/AtendimentoList';
import AtendimentoForm from './pages/Atendimentos/AtendimentoForm';
import AtendimentoDetalhes from './pages/Atendimentos/AtendimentoDetalhes';
import MaquinaList from './pages/Recursos/MaquinaList';
import MaquinaForm from './pages/Recursos/MaquinaForm';
import VeiculosList from './pages/Frota/VeiculosList';
import Dashboard from './pages/Dashboard/Dashboard';
import Relatorios from './pages/Relatorios/Relatorios';
import RelatorioProdutores from './pages/Relatorios/RelatorioProdutores';
import RelatorioAtendimentos from './pages/Relatorios/RelatorioAtendimentos';
import RelatorioPropriedades from './pages/Relatorios/RelatorioPropriedades';
import AdminPanel from './pages/Admin/AdminPanel';
import AdminLogs from './pages/Admin/AdminLogs';
import CulturaList from './pages/Tabelas/CulturaList';
import CulturaForm from './pages/Tabelas/CulturaForm';
import MeusDados from './pages/Secretaria/MeusDados';
import { canManageUsers } from './utils/roles';

const PrivateRoute = ({ children }) => {
  const { signed, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return signed ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  return canManageUsers(user?.perfil) ? children : <Navigate to="/" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={
        <PrivateRoute>
          <MainLayout />
        </PrivateRoute>
      }>
        <Route index element={<Dashboard />} />

        <Route
          path="secretaria"
          element={(
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          )}
        />
        <Route
          path="secretaria/usuarios"
          element={(
            <AdminRoute>
              <UserList />
            </AdminRoute>
          )}
        />
        <Route
          path="secretaria/usuarios/novo"
          element={(
            <AdminRoute>
              <UserForm />
            </AdminRoute>
          )}
        />
        <Route
          path="secretaria/usuarios/:id/editar"
          element={(
            <AdminRoute>
              <UserForm />
            </AdminRoute>
          )}
        />
        <Route
          path="secretaria/logs"
          element={(
            <AdminRoute>
              <AdminLogs />
            </AdminRoute>
          )}
        />
        <Route
          path="admin"
          element={(
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          )}
        />
        <Route
          path="admin/usuarios"
          element={(
            <AdminRoute>
              <UserList />
            </AdminRoute>
          )}
        />
        <Route
          path="admin/usuarios/novo"
          element={(
            <AdminRoute>
              <UserForm />
            </AdminRoute>
          )}
        />
        <Route
          path="admin/usuarios/:id/editar"
          element={(
            <AdminRoute>
              <UserForm />
            </AdminRoute>
          )}
        />
        <Route
          path="admin/logs"
          element={(
            <AdminRoute>
              <AdminLogs />
            </AdminRoute>
          )}
        />

        <Route path="produtores" element={<ProdutorList />} />
        <Route path="produtores/novo" element={<ProdutorForm />} />
        <Route path="produtores/:id" element={<ProdutorForm />} />

        <Route path="propriedades" element={<PropriedadeList />} />
        <Route path="propriedades/novo" element={<PropriedadeForm />} />
        <Route path="propriedades/:id/editar" element={<PropriedadeForm />} />

        <Route path="atendimentos" element={<AtendimentoList />} />
        <Route path="atendimentos/novo" element={<AtendimentoForm />} />
        <Route path="atendimentos/:id" element={<AtendimentoDetalhes />} />

        <Route path="recursos" element={<MaquinaList />} />
        <Route path="recursos/maquinas" element={<MaquinaList />} />
        <Route path="recursos/maquinas/novo" element={<MaquinaForm />} />
        <Route path="recursos/:id/editar" element={<MaquinaForm />} />

        <Route path="frota" element={<VeiculosList />} />

        <Route path="relatorios" element={<Relatorios />} />
        <Route path="relatorios/produtores" element={<RelatorioProdutores />} />
        <Route path="relatorios/atendimentos" element={<RelatorioAtendimentos />} />
        <Route path="relatorios/propriedades" element={<RelatorioPropriedades />} />
        <Route path="tabelas/culturas" element={<CulturaList />} />
        <Route path="tabelas/culturas/nova" element={<CulturaForm />} />
        <Route path="tabelas/culturas/:id/editar" element={<CulturaForm />} />
        <Route
          path="meus-dados"
          element={<MeusDados />}
        />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
