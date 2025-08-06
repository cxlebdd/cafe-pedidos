import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

type RootStackParamList = {
  Inicio: undefined;
  TomarPedido: undefined;
  Pedidos: undefined;
  Historial: undefined;
  Menu: undefined;
  Resumen: undefined;
  SalesDashboard: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type ButtonItem = {
  title: string;
  icon: string;
  screen: keyof RootStackParamList;
  colors: {
    background: string;
    iconBackground: string;
    iconColor: string;
    textColor: string;
  };
  fullWidth?: boolean;
};

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  const buttons: ButtonItem[] = [
    {
      title: 'Tomar Orden',
      icon: 'coffee-to-go',
      screen: 'TomarPedido',
      colors: {
        background: '#111',
        iconBackground: '#2ed573',
        iconColor: '#fff',
        textColor: '#ecf0f1',
      },
    },
    {
      title: 'Menú',
      icon: 'silverware-fork-knife',
      screen: 'Menu',
      colors: {
        background: '#111111',
        iconBackground: '#ee5253',
        iconColor: '#fff',
        textColor: '#eee',
      },
    },
    {
      title: 'Órdenes Pendientes',
      icon: 'format-list-bulleted',
      screen: 'Pedidos',
      colors: {
        background: '#111111',
        iconBackground: '#54a0ff',
        iconColor: '#fff',
        textColor: '#eee',
      },
    },
    {
      title: 'Historial',
      icon: 'history',
      screen: 'Historial',
      colors: {
        background: '#111111',
        iconBackground: '#ffd32a',
        iconColor: '#fff',
        textColor: '#eee',
      },
    },
    {
      title: 'Resumen',
      icon: 'chart-bar',
      screen: 'Resumen',
      colors: {
        background: '#111111',
        iconBackground: '#00d2d3',
        iconColor: '#fff',
        textColor: '#eee',
      },
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Café Cereza</Text>
      <View style={styles.grid}>
        {buttons.map((item) => (
          <TouchableOpacity
            key={item.title}
            activeOpacity={0.85}
            onPress={() => navigation.navigate(item.screen)}
            style={[
              styles.button,
              styles.fullWidthButton,
              { backgroundColor: item.colors.background },
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: item.colors.iconBackground },
              ]}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={36}
                color={item.colors.iconColor}
              />
            </View>
            <Text style={[styles.buttonText, { color: item.colors.textColor }]}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#ee5253',
    textAlign: 'center',
    marginBottom: 36,
    letterSpacing: 4,
  },
  grid: {
    flexDirection: 'column',
    gap: 20,
  },
  button: {
    height: 130,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  fullWidthButton: {
    width: '100%',
  },
  iconContainer: {
    borderRadius: 40,
    padding: 14,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 1.1,
  },
});
