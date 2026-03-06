import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
import MaquinaList from './pages/Recursos/MaquinaList';
import MaquinaForm from './pages/Recursos/MaquinaForm';
import Dashboard from './pages/Dashboard/Dashboard';
import Relatorios from './pages/Relatorios/Relatorios';
import RelatorioProdutores from './pages/Relatorios/RelatorioProdutores';
import RelatorioAtendimentos from './pages/Relatorios/RelatorioAtendimentos';
import RelatorioPropriedades from './pages/Relatorios/RelatorioPropriedades';

// Componente para rotas protegidas
const PrivateRoute = ({ children }) => {
  const { signed, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return signed ? children : <Navigate to="/login" />;
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
        
        {/* Rotas de Usuários */}
        <Route path="admin/usuarios" element={<UserList />} />
        <Route path="admin/usuarios/novo" element={<UserForm />} />
        
        {/* Rotas de Produtores */}
        <Route path="produtores" element={<ProdutorList />} />
        <Route path="produtores/novo" element={<ProdutorForm />} />
        
        {/* Rotas de Propriedades */}
        <Route path="propriedades" element={<PropriedadeList />} />
        <Route path="propriedades/novo" element={<PropriedadeForm />} />
        
        {/* Rotas de Atendimentos */}
        <Route path="atendimentos" element={<AtendimentoList />} />
        <Route path="atendimentos/novo" element={<AtendimentoForm />} />
        
        {/* Rotas de Recursos */}
        <Route path="recursos" element={<MaquinaList />} />
        <Route path="recursos/maquinas" element={<MaquinaList />} />
        <Route path="recursos/maquinas/novo" element={<MaquinaForm />} />

        {/* Rotas de Relatórios */}
        <Route path="relatorios" element={<Relatorios />} />
        <Route path="relatorios/produtores" element={<RelatorioProdutores />} />
        <Route path="relatorios/atendimentos" element={<RelatorioAtendimentos />} />
        <Route path="relatorios/propriedades" element={<RelatorioPropriedades />} />

        <Route path="admin" element={<div>Módulo Administrativo</div>} />
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
