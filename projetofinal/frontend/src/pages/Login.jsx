import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ContainerLogin,
  CardForm,
  GroupInput,
  BotaoForm
} from '../styles/EstilosLogin';

import logoagro from '../assets/logoagro.png';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('');
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
      console.error(erro);
      setErro(
        'Não foi possível conectar ao servidor. Verifique sua conexão.'
      );
    }
  };

  return (
    <ContainerLogin
      style={{
        minHeight: '100vh',
        background: '#1e1e1e',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1400px',
          height: '850px',
          display: 'flex',
          overflow: 'hidden'
        }}
      >
        {/* IMAGEM */}
        <div
          style={{
            flex: 1.3,
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
            background: '#8A9C77',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative'
          }}
        >
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              position: 'absolute',
              top: '25px',
              right: '35px',
              background: 'transparent',
              border: 'none',
              fontSize: '18px',
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
              width: '420px',
              marginTop: '40px',
              marginBottom: '20px'
            }}
          />

          <CardForm
            as="form"
            onSubmit={handleSubmit}
            style={{
              width: '85%',
              maxWidth: '550px',
              background: '#B4C1A5',
              borderRadius: '40px',
              padding: '40px'
            }}
          >
            <h1
              style={{
                textAlign: 'center',
                fontSize: '70px',
                fontFamily: 'Georgia, serif',
                fontWeight: '400',
                marginBottom: '35px',
                color: '#111'
              }}
            >
              Login
            </h1>

            <GroupInput>
              <input
                type="email"
                placeholder="Email/Tel"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
                style={{
                  width: '100%',
                  height: '60px',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0 18px',
                  fontSize: '18px',
                  marginBottom: '20px',
                  background: '#F4F4EF'
                }}
              />
            </GroupInput>

            <GroupInput>
              <input
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="current-password"
                required
                style={{
                  width: '100%',
                  height: '60px',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0 18px',
                  fontSize: '18px',
                  marginBottom: '20px',
                  background: '#F4F4EF'
                }}
              />
            </GroupInput>

            <GroupInput>
              <select
                value={tipoUsuario}
                onChange={(e) => setTipoUsuario(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '60px',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0 18px',
                  fontSize: '18px',
                  marginBottom: '20px',
                  background: '#F4F4EF'
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
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '25px',
                cursor: 'pointer'
              }}
            >
              <span
                style={{
                  fontSize: '18px',
                  color: '#333'
                }}
              >
                Lembrar-me
              </span>

              <div
                style={{
                  width: '55px',
                  height: '30px',
                  borderRadius: '30px',
                  background: lembrarMe ? '#4D8B3A' : '#ddd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: lembrarMe
                    ? 'flex-end'
                    : 'flex-start',
                  padding: '3px'
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
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
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  marginBottom: '20px'
                }}
              >
                {erro}
              </div>
            )}

            <BotaoForm
              type="submit"
              style={{
                width: '100%',
                height: '65px',
                background: '#F4F4EF',
                color: '#111',
                border: 'none',
                borderRadius: '12px',
                fontSize: '24px',
                fontWeight: '600',
                cursor: 'pointer'
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