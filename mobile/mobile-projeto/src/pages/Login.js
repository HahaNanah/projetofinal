import React, { useState } from 'react';
import { Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import {
  ContainerLogin,
  CardForm,
  Titulo,
  GroupInput,
  LabelInput,
  InputTexto,
  PickerWrapper,
  BotaoForm,
  BotaoTexto
} from '../styles/EstilosLogin';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('comprador'); 
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);

    const emailTratado = email.trim().toLowerCase();
    const dadosFormulario = {
      email: emailTratado,
      senha: senha,
      tipo_usuario: tipoUsuario
    };

    try {
    
     const resposta = await fetch('https://projetofinal-teal.vercel.app/api/login/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosFormulario)
      });

      const resultadoLogin = await respostaLogin.json().catch(() => ({}));

      if (!respostaLogin.ok) {
        Alert.alert(
          'Acesso Negado', 
          resultadoLogin.message || 'E-mail, senha ou tipo de usuário incorretos.'
        );
        setLoading(false);
        return;
      }

      const usuarioLogado = resultadoLogin.usuario;

      const dadosParaSalvar = {
        nome: 'Usuário Agrícola', 
        email: usuarioLogado.email,
        tipo_usuario: usuarioLogado.tipo_usuario
      };
      
      localStorage.setItem('UsuarioLogado', JSON.stringify(dadosParaSalvar));

      Alert.alert('Sucesso ', `Bem-vindo! Acessando como: ${usuarioLogado.tipo_usuario.toUpperCase()}`);
      
      navigation.navigate('Principal', { tipoUsuario: usuarioLogado.tipo_usuario }); 

    } catch (erro) {
      console.error('Erro de conexão:', erro);
      Alert.alert(
        'Erro de Conexão ', 
        'Servidor offline. Certifique-se de que o seu backend Express está rodando na porta 3000.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContainerLogin>
      <CardForm>
        <Titulo>Acessar Sistema</Titulo>

        <GroupInput>
          <LabelInput>E-mail</LabelInput>
          <InputTexto
            placeholder="exemplo@email.com"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </GroupInput>

        <GroupInput>
          <LabelInput>Senha</LabelInput>
          <InputTexto
            placeholder="Sua senha"
            placeholderTextColor="#999"
            secureTextEntry={true}
            value={senha}
            onChangeText={setSenha}
          />
        </GroupInput>

        <GroupInput>
          <LabelInput>Tipo de Usuário</LabelInput>
          <PickerWrapper>
            <Picker
              selectedValue={tipoUsuario}
              onValueChange={(itemValue) => setTipoUsuario(itemValue)}
              style={{ height: 45, color: '#121212', borderWidth: 0 }}
            >
              <Picker.Item label="Comprador" value="comprador" />
              <Picker.Item label="Vendedor" value="vendedor" />
            </Picker>
          </PickerWrapper>
        </GroupInput>

        <BotaoForm onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <BotaoTexto>Entrar</BotaoTexto>}
        </BotaoForm>
      </CardForm>
    </ContainerLogin>
  );
}