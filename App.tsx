import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './app/screens/HomeScreen';
import TakeOrderScreen from './app/screens/TakeOrderScreen';
import OrdersScreen from './app/screens/OrdersScreen';
import HistoryScreen from './app/screens/HistoryScreen';
import MenuScreen from './app/screens/MenuScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator
        initialRouteName="Inicio"
        screenOptions={{
          headerStyle: { backgroundColor: '#1f2937' },
          headerTintColor: 'white',
        }}
      >
        <Stack.Screen name="Inicio" component={HomeScreen} />
        <Stack.Screen name="TomarPedido" component={TakeOrderScreen} />
        <Stack.Screen name="Pedidos" component={OrdersScreen} />
        <Stack.Screen name="Historial" component={HistoryScreen} />
        <Stack.Screen name="Menu" component={MenuScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
