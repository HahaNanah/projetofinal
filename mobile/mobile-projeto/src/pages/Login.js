import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [lembrarMe, setLembrarMe] = useState(false);
  const [erro, setErro] = useState(''); 

  // Carrega o e-mail salvo assim que o app abre
  useEffect(() => {
    async function carregarEmailSalvo() {
      try {
        const emailSalvo = await AsyncStorage.getItem('emailLembrado');
        if (emailSalvo) {
          setEmail(emailSalvo);
          setLembrarMe(true);
        }
      } catch (erro) {
        console.log('Erro ao ler emailLembrado:', erro);
      }
    }
    carregarEmailSalvo();
  }, []);

  const handleSubmit = async () => {
    setErro(''); 

    if (!email || !senha) {
      setErro('Por favor, preencha todos os campos.');
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

      const resultadoLogin = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        setErro(resultadoLogin.message || 'E-mail, senha ou tipo de usuário incorretos.');
        setLoading(false);
        return;
      }

      const usuarioLogado = resultadoLogin.usuario || resultadoLogin;

      const dadosParaSalvar = {
        nome: usuarioLogado.nome || 'Usuário Agrícola', 
        email: usuarioLogado.email || emailTratado,
        tipo_usuario: usuarioLogado.tipo_usuario || tipoUsuario
      };

      // 🧼 Limpa resíduos de sessões anteriores de forma assíncrona
      await Promise.all([
        AsyncStorage.removeItem('UsuarioLogado'),
        AsyncStorage.removeItem('NaoLembrarMe')
      ]);

      // 📱 Lógica de Persistência Equivalente à Web adaptada para Mobile
      if (lembrarMe) {
        // ✅ Marcou "Lembrar-me" -> Guarda a sessão e preserva o e-mail na próxima abertura
        await Promise.all([
          AsyncStorage.setItem('UsuarioLogado', JSON.stringify(dadosParaSalvar)),
          AsyncStorage.setItem('emailLembrado', emailTratado)
        ]);
      } else {
        // ❌ Não marcou "Lembrar-me" -> Cria o gatilho "NaoLembrarMe" para o App.js ler no próximo Reload
        await Promise.all([
          AsyncStorage.setItem('UsuarioLogado', JSON.stringify(dadosParaSalvar)),
          AsyncStorage.setItem('NaoLembrarMe', 'true'), 
          AsyncStorage.removeItem('emailLembrado')
        ]);
      }

      // 🔥 Redireciona limpando a pilha de telas para consolidar a segurança
      navigation.reset({
        index: 0,
        routes: [{ name: 'Principal' }],
      });

    } catch (erro) {
      console.error('Erro de conexão:', erro);
      setErro('Não foi possível conectar ao servidor. Verifique sua conexão.');
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

        {/* 🎛️ Botão Chave Seletora (Switch de ir para frente e para trás) */}
        <TouchableOpacity 
          onPress={() => setLembrarMe(!lembrarMe)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 25,
            marginTop: 10,
            paddingVertical: 5
          }}
          activeOpacity={0.8}
        >
          <Text style={{ color: '#444', fontSize: 15, fontWeight: '500' }}>
            Lembrar-me do acesso?
          </Text>

          {/* Estrutura do Trilho do Switch */}
          <View style={{
            width: 46,
            height: 24,
            borderRadius: 12,
            backgroundColor: lembrarMe ? '#00b874' : '#e0e0e0',
            padding: 2,
            justifyContent: 'center',
            alignItems: lembrarMe ? 'flex-end' : 'flex-start',
            borderWidth: 1,
            borderColor: lembrarMe ? '#00a365' : '#ccc'
          }}>
            {/* Bolinha deslizante */}
            <View style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: '#ffffff',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 1.41,
              elevation: 2,
            }} />
          </View>
        </TouchableOpacity>

        {/* 📱 Caixa de Erro nativa para Mobile */}
        {erro ? (
          <View style={{
            backgroundColor: '#ffeaee',
            padding: 12,
            borderRadius: 8,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#ffccd5',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Text style={{ color: '#e60026', fontSize: 14, fontWeight: '500', textAlign: 'center' }}>
              {erro}
            </Text>
          </View>
        ) : null}

        <BotaoForm onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <BotaoTexto>Entrar</BotaoTexto>}
        </BotaoForm>
      </CardForm>
    </ContainerLogin>
  );
}
