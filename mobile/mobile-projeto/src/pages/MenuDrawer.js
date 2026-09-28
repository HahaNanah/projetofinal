import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Principal from './Principal'; 
import Categoria from './Categoria'; 
import Produtos from './Produtos'; 

const Tab = createBottomTabNavigator();

export default function MenuDrawer({ route }) {

  const params = route.params || {};
  const tipoUsuarioRaw = params.tipoUsuario || 'comprador';
  

  const tipoUsuario = tipoUsuarioRaw.trim().toLowerCase();

  console.log("Perfil ativo no MenuDrawer:", tipoUsuario);

  return (
    <Tab.Navigator
      initialRouteName="CatalogoAba"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#00b874',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        }
      }}
    >
      <Tab.Screen 
        name="CatalogoAba" 
        component={Principal} 
        options={{ title: 'Catálogo' }} 
      />

      {tipoUsuario === 'vendedor' ? (
        <>
          <Tab.Screen 
            name="CadastroProdutoAba" 
            component={Produtos} 
            options={{ title: 'Cadastrar Produto' }} 
          />
          <Tab.Screen 
            name="CategoriaAba" 
            component={Categoria} 
            options={{ title: 'Categorias' }} 
          />
        </>
      ) : null}
    </Tab.Navigator>
  );
}