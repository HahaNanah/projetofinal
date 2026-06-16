import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ContainerLogin,
  CardForm,
  GroupInput,
  BotaoForm
} from '../styles/EstilosLogin';

import logoAgro from '../assets/logoagro.png';

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
      senha,
      tipo_usuario: tipoUsuario
    };

    try {
      const resposta = await fetch(
        'https://projetofinal-teal.vercel.app/api/login/auth',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dadosUsuario)
        }
      );

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
          localStorage.setItem(
            'UsuarioLogado',
            JSON.stringify(dadosParaSalvar)
          );
          localStorage.setItem('emailLembrado', emailTratado);
        } else {
          sessionStorage.setItem(
            'UsuarioLogado',
            JSON.stringify(dadosParaSalvar)
          );
          sessionStorage.setItem('NaoLembrarMe', 'true');
          localStorage.removeItem('emailLembrado');
        }

        navigate('/principal', { replace: true });
      } else {
        setErro(
          resultado.message ||
            'E-mail, senha ou tipo de usuário incorretos.'
        );
      }
    } catch (erro) {
      console.error('Erro ao conectar com a API:', erro);

      setErro(
        'Não foi possível conectar ao servidor. Verifique sua conexão.'
      );
    }
  };

  return (
    <ContainerLogin
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#1f1f1f',
        padding: '20px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
          height: '700px',
          display: 'flex',
          overflow: 'hidden',
          boxShadow: '0 0 25px rgba(0,0,0,0.4)'
        }}
      >
        {/* IMAGEM */}
        <div
          style={{
            flex: 1.4,
            backgroundImage:
              'url(https://i.pinimg.com/736x/e1/09/32/e109325a2a7b288a95723965f4dbbfc6.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        {/* FORMULÁRIO */}
        <div
          style={{
            flex: 1,
            background: '#879f72',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            padding: '30px'
          }}
        >
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              position: 'absolute',
              top: '25px',
              right: '35px',
              border: 'none',
              background: 'transparent',
              fontSize: '20px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Voltar
          </button>

          <img
            src={logoAgro}
            alt="ConectaAgro"
            style={{
              width: '320px',
              marginBottom: '15px'
            }}
          />

          <h1
            style={{
              fontSize: '58px',
              fontFamily: 'Georgia, serif',
              fontWeight: '400',
              marginBottom: '25px',
              color: '#111'
            }}
          >
            Login
          </h1>

          <CardForm
            as="form"
            onSubmit={handleSubmit}
            style={{
              width: '100%',
              maxWidth: '420px',
              background: '#a8b89d',
              borderRadius: '35px',
              padding: '35px'
            }}
          >
            <GroupInput>
              <input
                type="email"
                placeholder="Email/Tel"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '48px',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0 15px',
                  fontSize: '17px',
                  marginBottom: '18px'
                }}
              />
            </GroupInput>

            <GroupInput>
              <input
                type="password"
                placeholder="Senha"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '48px',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0 15px',
                  fontSize: '17px',
                  marginBottom: '18px'
                }}
              />
            </GroupInput>

            <GroupInput>
              <select
                value={tipoUsuario}
                onChange={(e) => setTipoUsuario(e.target.value)}
                style={{
                  width: '100%',
                  height: '48px',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0 15px',
                  fontSize: '17px',
                  marginBottom: '18px'
                }}
              >
                <option value="">Eu estou entrando como...</option>
                <option value="comprador">Comprador</option>
                <option value="vendedor">Vendedor</option>
              </select>
            </GroupInput>

            <div
              onClick={() => setLembrarMe(!lembrarMe)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
                cursor: 'pointer'
              }}
            >
              <span>Lembrar-me</span>

              <div
                style={{
                  width: '46px',
                  height: '24px',
                  borderRadius: '12px',
                  backgroundColor: lembrarMe ? '#00b874' : '#ddd',
                  padding: '2px',
                  display: 'flex',
                  justifyContent: lembrarMe
                    ? 'flex-end'
                    : 'flex-start'
                }}
              >
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#fff'
                  }}
                />
              </div>
            </div>

            {erro && (
              <div
                style={{
                  backgroundColor: '#ffeaee',
                  color: '#e60026',
                  border: '1px solid #ffccd5',
                  padding: '10px',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  textAlign: 'center'
                }}
              >
                {erro}
              </div>
            )}

            <BotaoForm
              type="submit"
              style={{
                width: '100%',
                background: '#eef2eb',
                color: '#111',
                borderRadius: '10px',
                fontSize: '20px',
                fontWeight: '600'
              }}
            >
              Logar
            </BotaoForm>
          </CardForm>
        </div>
      </div>
    </ContainerLogin>
  );
}

export default Login;