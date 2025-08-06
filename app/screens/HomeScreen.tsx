import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
};

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  const buttons: ButtonItem[] = [
    {
      title: 'Tomar Orden',
      icon: 'coffee-to-go',
      screen: 'TomarPedido',
      colors: {
        background: 'rgba(46, 213, 115, 0.1)',
        iconBackground: '#2ed573',
        iconColor: '#fff',
        textColor: '#dfe6e9',
      },
    },
    {
      title: 'Menú',
      icon: 'silverware-fork-knife',
      screen: 'Menu',
      colors: {
        background: 'rgba(238, 82, 83, 0.1)',
        iconBackground: '#ee5253',
        iconColor: '#fff',
        textColor: '#f5f6fa',
      },
    },
    {
      title: 'Órdenes Pendientes',
      icon: 'format-list-bulleted',
      screen: 'Pedidos',
      colors: {
        background: 'rgba(84, 160, 255, 0.1)',
        iconBackground: '#54a0ff',
        iconColor: '#fff',
        textColor: '#f1f2f6',
      },
    },
    {
      title: 'Historial',
      icon: 'history',
      screen: 'Historial',
      colors: {
        background: 'rgba(255, 211, 42, 0.1)',
        iconBackground: '#ffd32a',
        iconColor: '#000',
        textColor: '#fefefe',
      },
    },
    {
      title: 'Resumen',
      icon: 'chart-bar',
      screen: 'Resumen',
      colors: {
        background: 'rgba(0, 210, 211, 0.1)',
        iconBackground: '#00d2d3',
        iconColor: '#000',
        textColor: '#f1f2f6',
      },
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Café Cereza</Text>

      <View style={styles.list}>
        {buttons.map((item) => (
          <TouchableOpacity
            key={item.title}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.9}
            style={[styles.row, { backgroundColor: item.colors.background }]}
          >
            <View
              style={[
                styles.iconBox,
                { backgroundColor: item.colors.iconBackground },
              ]}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={26}
                color={item.colors.iconColor}
              />
            </View>
            <View style={styles.textBox}>
              <Text style={[styles.label, { color: item.colors.textColor }]}>
                {item.title}
              </Text>
              <Text style={styles.subtext}>Ir a {item.title}</Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#555"
              style={{ marginLeft: 'auto' }}
            />
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
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ee5253',
    marginBottom: 30,
    textAlign: 'center',
    letterSpacing: 2,
  },
  list: {
    flexDirection: 'column',
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    borderRadius: 10,
    padding: 10,
    marginRight: 14,
  },
  textBox: {
    flexDirection: 'column',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtext: {
    color: '#888',
    fontSize: 13,
  },
});
