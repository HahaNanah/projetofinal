import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Login from './src/pages/Login'; 
import Principal from './src/pages/Principal'; 

const Stack = createNativeStackNavigator();

export default function App() {
  const [rotaInicial, setRotaInicial] = useState(null);

  useEffect(() => {
    async function verificarSessaoAoAtualizar() {
      try {
        const naoLembrar = await AsyncStorage.getItem('NaoLembrarMe');
        
        // ❌ NÃO MARCOU "Lembrar-me" -> Ao "atualizar" o app, limpa tudo e vai para o Login
        if (naoLembrar === 'true') {
          await AsyncStorage.removeItem('UsuarioLogado');
          await AsyncStorage.removeItem('NaoLembrarMe');
          setRotaInicial('Login');
        } else {
          // ✅ MARCOU "Lembrar-me" -> Continua logado se houver dados
          const usuarioSalvo = await AsyncStorage.getItem('UsuarioLogado');
          if (usuarioSalvo) {
            setRotaInicial('Principal');
          } else {
            setRotaInicial('Login');
          }
        }
      } catch (erro) {
        console.log('Erro ao checar atualização do app:', erro);
        setRotaInicial('Login');
      }
    }

    verificarSessaoAoAtualizar();
  }, []);

  // Tela de loading enquanto o AsyncStorage decide a rota correta
  if (!rotaInicial) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
        <ActivityIndicator size="large" color="#00b874" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={rotaInicial} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Principal" component={Principal} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}