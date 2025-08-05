import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

type RootStackParamList = {
  Inicio: undefined;
  TomarPedido: undefined;
  Pedidos: undefined;
  Historial: undefined;
  Menu: undefined;
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
      title: 'Tomar Pedido',
      icon: 'coffee-to-go',
      screen: 'TomarPedido',
      colors: {
        background: '#111',
        iconBackground: '#2ed573',
        iconColor: '#fff',
        textColor: '#ecf0f1',
      },
      fullWidth: true,
    },
    {
      title: 'Gestionar Menú',
      icon: 'silverware-fork-knife',
      screen: 'Menu',
      colors: {
        background: '#111111',
        iconBackground: '#555555',
        iconColor: '#ccc',
        textColor: '#eee',
      },
      fullWidth: true,
    },
    {
      title: 'Ver Pedidos',
      icon: 'format-list-bulleted',
      screen: 'Pedidos',
      colors: {
        background: '#111111',
        iconBackground: '#3b5998',
        iconColor: '#fff',
        textColor: '#eee',
      },
      fullWidth: false,
    },
    {
      title: 'Historial',
      icon: 'history',
      screen: 'Historial',
      colors: {
        background: '#111111',
        iconBackground: '#d48806',
        iconColor: '#fff',
        textColor: '#eee',
      },
      fullWidth: false,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Café Cereza</Text>
      <View style={styles.grid}>
        {buttons.map((item) => (
          <TouchableOpacity
            key={item.title}
            activeOpacity={0.85}
            onPress={() => navigation.navigate(item.screen as any)}
            style={[
              styles.button,
              item.fullWidth ? styles.fullWidthButton : styles.halfWidthButton,
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
    </View>
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
    color: '#ee5253', // rojo elegante igual que tus otros textos
    textAlign: 'center',
    marginBottom: 36,
    letterSpacing: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  button: {
    height: 130,
    borderRadius: 24,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  fullWidthButton: {
    width: '100%',
  },
  halfWidthButton: {
    width: '48%',
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
