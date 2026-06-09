import React, { useState } from 'react';
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dadosUsuario = {
      email: email,
      senha: senha,
      tipo_usuario: tipoUsuario
    };

    try {
 
      const resposta = await fetch('https://projetofinal-teal.vercel.app/api/login/auth',  {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosUsuario)
      });

      const resultado = await resposta.json();

      if (resposta.ok) {
        alert(`Bem-vindo! Login efetuado como ${tipoUsuario}.`);
      } else {
        alert(`Erro no acesso: ${resultado.message || 'Credenciais inválidas'}`);
      }
    } catch (erro) {
      console.error('Erro ao conectar com a API:', erro);
      alert('Erro ao conectar com o servidor da API.');
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
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </GroupInput>

        <GroupInput>
          <label>Tipo de Usuário</label>
          <select
            value={tipoUsuario}
            onChange={(e) => setTipoUsuario(e.target.value)}
          >
            <option value="comprador">Comprador</option>
            <option value="vendedor">Vendedor</option>
          </select>
        </GroupInput>

        <BotaoForm type="submit">
          Entrar
        </BotaoForm>
      </CardForm>
    </ContainerLogin>
  );
}

export default Login;