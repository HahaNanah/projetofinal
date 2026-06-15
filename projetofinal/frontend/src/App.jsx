import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Principal from './pages/Principal';

// Função auxiliar para buscar o usuário de qualquer um dos armazenamentos
const obterUsuarioLogado = () => {
  return localStorage.getItem('UsuarioLogado') || sessionStorage.getItem('UsuarioLogado');
};

function RotaProtegida({ children }) {
  const usuarioSalvo = obterUsuarioLogado();
  if (usuarioSalvo) {
    return children;
  }
  return <Navigate to="/login" replace />;
}

function RotaPublica({ children }) {
  const usuarioSalvo = obterUsuarioLogado();
  if (usuarioSalvo) {
    return <Navigate to="/principal" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<RotaPublica><Login /></RotaPublica>} />
        <Route path="/principal" element={<RotaProtegida><Principal /></RotaProtegida>} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;