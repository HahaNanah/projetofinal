import React from 'react';

function Principal() {
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Painel de Controle - Sistema Agrícola</h1>
      <p>Bem-vindo à tela principal! O seu sistema de rotas e estilos está funcionando 100%.</p>
      
      <hr style={{ margin: '20px 0', borderColor: '#cbd5e1' }} />
      
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ background: '#e2e8f0', padding: '20px', borderRadius: '8px', flex: 1 }}>
          <h3>Meus Produtos</h3>
          <p>Gerencie o estoque e os produtos agrícolas aqui.</p>
        </div>
        
        <div style={{ background: '#e2e8f0', padding: '20px', borderRadius: '8px', flex: 1 }}>
          <h3>Vendas / Compras</h3>
          <p>Acompanhe os pedidos em tempo real.</p>
        </div>
      </div>
    </div>
  );
}

export default Principal;