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
          maxWidth: '1500px',
          height: '900px',
          display: 'flex',
          overflow: 'hidden'
        }}
      >
        {/* IMAGEM ESQUERDA */}
        <div
          style={{
            flex: 1.25,
            backgroundImage:
              'url(https://i.pinimg.com/736x/e1/09/32/e109325a2a7b288a95723965f4dbbfc6.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        {/* LADO DIREITO */}
        <div
          style={{
            flex: 1,
            background: '#8B9D79',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
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
              background: 'transparent',
              border: 'none',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Voltar
          </button>

          <CardForm
            as="form"
            onSubmit={handleSubmit}
            style={{
              width: '85%',
              maxWidth: '620px',
              background: '#B6C2A8',
              borderRadius: '45px',
              padding: '50px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
            }}
          >
            <img
              src={logoAgro}
              alt="ConectaAgro"
              style={{
                width: '360px',
                marginBottom: '10px'
              }}
            />

            <h1
              style={{
                fontSize: '72px',
                fontFamily: 'Georgia, serif',
                fontWeight: '400',
                color: '#111',
                marginBottom: '35px'
              }}
            >
              Login
            </h1>

            <GroupInput style={{ width: '100%' }}>
              <input
                type="email"
                placeholder="Email/Tel"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '65px',
                  border: 'none',
                  borderRadius: '15px',
                  padding: '0 20px',
                  fontSize: '18px',
                  background: '#F3F3EE',
                  marginBottom: '22px'
                }}
              />
            </GroupInput>

            <GroupInput style={{ width: '100%' }}>
              <input
                type="password"
                placeholder="Senha"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '65px',
                  border: 'none',
                  borderRadius: '15px',
                  padding: '0 20px',
                  fontSize: '18px',
                  background: '#F3F3EE',
                  marginBottom: '22px'
                }}
              />
            </GroupInput>

            <GroupInput style={{ width: '100%' }}>
              <select
                value={tipoUsuario}
                onChange={(e) => setTipoUsuario(e.target.value)}
                style={{
                  width: '100%',
                  height: '65px',
                  border: 'none',
                  borderRadius: '15px',
                  padding: '0 20px',
                  fontSize: '18px',
                  background: '#F3F3EE',
                  marginBottom: '22px'
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
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '35px',
                cursor: 'pointer'
              }}
            >
              <span
                style={{
                  fontSize: '20px',
                  fontFamily: 'Georgia'
                }}
              >
                Lembrar-me
              </span>

              <div
                style={{
                  width: '65px',
                  height: '35px',
                  borderRadius: '30px',
                  background: lembrarMe ? '#5E9648' : '#ddd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: lembrarMe ? 'flex-end' : 'flex-start',
                  padding: '4px'
                }}
              >
                <div
                  style={{
                    width: '27px',
                    height: '27px',
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
                  marginBottom: '20px',
                  width: '100%',
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
                height: '70px',
                borderRadius: '15px',
                background: '#F3F3EE',
                color: '#000',
                border: 'none',
                fontSize: '24px',
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