import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Principal() {
  const navigate = useNavigate();

  const [usuario] = useState(() => {
    try {
      const usuarioSalvo = localStorage.getItem('UsuarioLogado') || sessionStorage.getItem('UsuarioLogado');
      return usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
    } catch (erro) {
      console.log("Erro na leitura inicial do banco local:", erro);
      return null;
    }
  });

  // ⚡ Lógica de interceptação do F5 (Instrução solicitada)
  useEffect(() => {
    const handleRefresh = () => {
      if (sessionStorage.getItem('NaoLembrarMe')) {
        sessionStorage.removeItem('UsuarioLogado');
        sessionStorage.removeItem('NaoLembrarMe');
      }
    };

    // Escuta o evento de recarregamento/fechamento antes de descarregar a página
    window.addEventListener('beforeunload', handleRefresh);

    return () => {
      window.removeEventListener('beforeunload', handleRefresh);
    };
  }, []);

  function botaoLogout() {
    try {
      localStorage.removeItem('UsuarioLogado');
      sessionStorage.removeItem('UsuarioLogado');
      sessionStorage.removeItem('NaoLembrarMe');
    } catch (erro) {
      console.log("Erro ao limpar dados no logout:", erro);
    }
    navigate('/login', { replace: true });
  }

  if (!usuario) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa', fontFamily: 'Arial, sans-serif' }}>
        <p style={{ fontSize: '16px', color: '#666', fontWeight: '500' }}>Sessão inválida. Redirecionando...</p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh', padding: '20px',
      justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa',
      fontFamily: 'Arial, sans-serif', boxSizing: 'border-box'
    }}>
      
      {/* Card do Usuário (Mantido Igual) */}
      <div style={{
        backgroundColor: '#fff', padding: '25px', borderRadius: '12px', width: '100%', maxWidth: '400px', 
        display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        marginBottom: '25px', boxSizing: 'border-box'
      }}>
        <h2 style={{ fontSize: '22px', marginBottom: '12px', fontWeight: 'bold', color: '#111', marginTop: 0 }}>
          Nome: {usuario.nome || 'Não informado'}
        </h2>

        <p style={{ fontSize: '18px', marginBottom: '12px', color: '#444', marginTop: 0 }}>
          Email: {usuario.email}
        </p>

        <span style={{ 
          fontSize: '16px', fontWeight: '600',
          color: usuario.tipo_usuario === 'vendedor' ? '#fff' : '#00b874',
          backgroundColor: usuario.tipo_usuario === 'vendedor' ? '#00b874' : '#e6f8f1',
          padding: '6px 15px', borderRadius: '20px', textTransform: 'uppercase', marginTop: '5px'
        }}>
          Perfil: {usuario.tipo_usuario || 'Não definido'}
        </span>
      </div>

      {/* Botão de Logout */}
      <button 
        onClick={botaoLogout}
        style={{
          backgroundColor: '#ff4d4d', color: '#fff', fontWeight: 'bold', fontSize: '16px',
          padding: '14px 40px', borderRadius: '8px', border: 'none', cursor: 'pointer',
          boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.2)', transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#e60000'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#ff4d4d'}
      >
        Sair do Sistema
      </button>

    </div>
  );
}

export default Principal;