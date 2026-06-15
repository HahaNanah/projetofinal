import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ContainerLogin,
  CardForm,
  Titulo,
  GroupInput,
  BotaoForm
} from '../styles/EstilosLogin';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('comprador'); 
  const [lembrarMe, setLembrarMe] = useState(false);
  const [erro, setErro] = useState(''); 
  
  const navigate = useNavigate();

  useEffect(() => {
    const emailSalvo = localStorage.getItem('emailLembrado');
    if (emailSalvo) {
      setEmail(emailSalvo);
      setLembrarMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setErro(''); 

    const emailTratado = email.trim().toLowerCase();
    
    const dadosUsuario = {
      email: emailTratado,
      senha: senha,
      tipo_usuario: tipoUsuario
    };

    try {
      const resposta = await fetch('https://projetofinal-teal.vercel.app/api/login/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosUsuario)
      });

      const resultado = await resposta.json();

      if (resposta.ok) {
        const usuarioDados = resultado.usuario || resultado;

        const dadosParaSalvar = {
          nome: usuarioDados.nome || 'Usuário Agrícola', 
          email: usuarioDados.email || emailTratado,
          tipo_usuario: usuarioDados.tipo_usuario || tipoUsuario,
          token: resultado.token || ''
        };

        localStorage.removeItem('UsuarioLogado');
        sessionStorage.removeItem('UsuarioLogado');
        sessionStorage.removeItem('NaoLembrarMe');

        if (lembrarMe) {
          localStorage.setItem('UsuarioLogado', JSON.stringify(dadosParaSalvar));
          localStorage.setItem('emailLembrado', emailTratado);
        } else {
          sessionStorage.setItem('UsuarioLogado', JSON.stringify(dadosParaSalvar));
          sessionStorage.setItem('NaoLembrarMe', 'true'); 
          localStorage.removeItem('emailLembrado');
        }

        navigate('/principal', { replace: true }); 
        
      } else {
        setErro(resultado.message || 'E-mail, senha ou tipo de usuário incorretos.');
      }
    } catch (erro) {
      console.error('Erro ao conectar com a API:', erro);
      setErro('Não foi possível conectar ao servidor. Verifique sua conexão.');
    }
  };

  return (
    <ContainerLogin>
      <CardForm as="form" onSubmit={handleSubmit}>
        <Titulo>Acessar Sistema</Titulo>

        <GroupInput>
          <label>E-mail</label>
          <input
            type="email"
            placeholder="exemplo@email.com"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </GroupInput>

        <GroupInput>
          <label>Senha</label>
          <input
            type="password"
            placeholder="Sua senha"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </GroupInput>

        <GroupInput>
          <label>Tipo de Usuário</label>
          <select value={tipoUsuario} onChange={(e) => setTipoUsuario(e.target.value)}>
            <option value="comprador">Comprador</option>
            <option value="vendedor">Vendedor</option>
          </select>
        </GroupInput>

        {/* 🎛️ Switch Deslizante (Ir para frente e para trás) */}
        <div 
          onClick={() => setLembrarMe(!lembrarMe)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '25px', 
            marginTop: '10px',
            userSelect: 'none',
            cursor: 'pointer'
          }}
        >
          <span style={{ fontSize: '15px', color: '#444', fontWeight: '500' }}>
            Lembrar-me do acesso?
          </span>

          {/* Trilho do Switch */}
          <div style={{
            width: '46px',
            height: '24px',
            borderRadius: '12px',
            backgroundColor: lembrarMe ? '#00b874' : '#e0e0e0',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: lembrarMe ? 'flex-end' : 'flex-start',
            transition: 'background-color 0.2s ease, border-color 0.2s ease',
            border: lembrarMe ? '1px solid #00a365' : '1px solid #ccc',
            boxSizing: 'border-box'
          }}>
            {/* Bolinha do Switch */}
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              boxShadow: '0px 1px 3px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s ease'
            }} />
          </div>
        </div>

        {/* 📱 Caixa de Erro Estilizada */}
        {erro && (
          <div style={{
            backgroundColor: '#ffeaee',
            color: '#e60026',
            border: '1px solid #ffccd5',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '20px',
            width: '100%',
            boxSizing: 'border-box',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}>
             {erro}
          </div>
        )}

        <BotaoForm type="submit">Entrar</BotaoForm>
      </CardForm>
    </ContainerLogin>
  );
}

export default Login;