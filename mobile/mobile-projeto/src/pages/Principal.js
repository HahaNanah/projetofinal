import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

export default function Principal({ navigation }) {
    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        async function carregarUsuario() {
            try {
                const usuarioSalvo = await AsyncStorage.getItem('UsuarioLogado');

                if (usuarioSalvo) {
                    const dados = JSON.parse(usuarioSalvo);
                    setUsuario(dados);
                } else {
                    // Se tentar forçar a rota sem dados de sessão válidos, expulsa para o Login
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Login' }],
                    });
                }
            } catch (erro) {
                console.log("Erro ao carregar dados do AsyncStorage:", erro);
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                });
            }
        }

        carregarUsuario();
    }, []);

    async function botaoLogout() {
        try {
            // Remove a sessão de login ativa e a chave de controle temporário
            await AsyncStorage.removeItem('UsuarioLogado');
            await AsyncStorage.removeItem('NaoLembrarMe');
        } catch (erro) {
            console.log("Erro ao limpar dados no logout:", erro);
        }
        
        // Redireciona redefinindo o histórico para garantir segurança estrita
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    }

    if (!usuario) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
                <Text style={{ fontSize: 16, color: '#666', fontWeight: '500' }}>Carregando dados do perfil...</Text>
            </View>
        );
    }

    return (
        <View style={{
            flex: 1,
            padding: 20,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f8f9fa'
        }}>
            <View style={{
                backgroundColor: '#fff',
                padding: 25,
                borderRadius: 12,
                width: '100%',
                maxWidth: 400, 
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                marginBottom: 25
            }}>
                <Text style={{ fontSize: 22, marginBottom: 12, fontWeight: 'bold', color: '#111' }}>
                    Nome: {usuario.nome || 'Não informado'}
                </Text>

                <Text style={{ fontSize: 18, marginBottom: 12, color: '#444' }}>
                    Email: {usuario.email}
                </Text>

                <Text style={{ 
                    fontSize: 16, 
                    fontWeight: '600',
                    color: usuario.tipo_usuario === 'vendedor' ? '#fff' : '#00b874',
                    backgroundColor: usuario.tipo_usuario === 'vendedor' ? '#00b874' : '#e6f8f1',
                    paddingHorizontal: 15,
                    paddingVertical: 6,
                    borderRadius: 20,
                    textTransform: 'uppercase',
                    marginTop: 5
                }}>
                    Perfil: {usuario.tipo_usuario || 'Não definido'}
                </Text>
            </View>

            <TouchableOpacity 
                onPress={botaoLogout}
                style={{
                    backgroundColor: '#ff4d4d',
                    paddingHorizontal: 40,
                    paddingVertical: 14,
                    borderRadius: 8,
                    elevation: 2,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 1.41,
                }}
            >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                    Sair do Sistema
                </Text>
            </TouchableOpacity>
        </View>
    );
}