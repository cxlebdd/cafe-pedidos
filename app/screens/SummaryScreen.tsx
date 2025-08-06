import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type Product = {
  id: string;
  name: string;
  price: number;
};

type SelectedProduct = {
  product: Product;
  quantity: number;
  notes: string;
};

type Order = {
  id: string;
  orderNumber: number;
  items: SelectedProduct[];
  total: string;
  createdAt: string;
};

const FILTERS = [
  { label: 'Hoy', days: 0 },
  { label: '7 días', days: 7 },
  { label: '30 días', days: 30 },
  { label: 'Todos', days: null },
];

export default function SummaryScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState<number>(0);

  useEffect(() => {
    const load = async () => {
      const raw = await AsyncStorage.getItem('pedidosHistorial');
      if (raw) {
        const parsed: Order[] = JSON.parse(raw);
        setOrders(parsed);
        applyFilter(parsed, FILTERS[activeFilter].days);
      }
    };
    load();
  }, []);

  const applyFilter = (data: Order[], days: number | null) => {
    if (days === null) {
      setFilteredOrders(data);
    } else {
      const now = new Date();
      const filtered = data.filter((o) => {
        const created = new Date(o.createdAt);
        if (days === 0) {
          return (
            created.getDate() === now.getDate() &&
            created.getMonth() === now.getMonth() &&
            created.getFullYear() === now.getFullYear()
          );
        } else {
          const daysAgo = new Date();
          daysAgo.setDate(now.getDate() - days);
          return created >= daysAgo;
        }
      });
      setFilteredOrders(filtered);
    }
  };

  const handleFilterPress = (index: number) => {
    setActiveFilter(index);
    applyFilter(orders, FILTERS[index].days);
  };

  const parseMoney = (str: string) => {
    const clean = parseFloat(str?.replace(/[^0-9.]/g, '') || '0');
    return isNaN(clean) ? 0 : clean;
  };

  const totalRevenue = filteredOrders.reduce(
    (sum, o) => sum + parseMoney(o.total),
    0
  );

  const mostExpensiveOrder = filteredOrders.reduce((max, o) => {
    return parseMoney(o.total) > parseMoney(max.total) ? o : max;
  }, {} as Order);

  const productCount: Record<string, { name: string; total: number }> = {};
  filteredOrders.forEach((order) => {
    order.items.forEach((item) => {
      if (!productCount[item.product.id]) {
        productCount[item.product.id] = {
          name: item.product.name,
          total: item.quantity,
        };
      } else {
        productCount[item.product.id].total += item.quantity;
      }
    });
  });

  const mostSold = Object.values(productCount).sort(
    (a, b) => b.total - a.total
  )[0];

  const Card = ({
    icon,
    title,
    value,
    valueColor = '#ecf0f1',
  }: {
    icon?: string;
    title: string;
    value: string | React.ReactNode;
    valueColor?: string;
  }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color="#aaa"
            style={{ marginRight: 8 }}
          />
        )}
        <Text style={styles.cardTitle}>{title}:</Text>
      </View>
      <Text style={[styles.cardValue, { color: valueColor }]}>{value}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Resumen de ventas</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {FILTERS.map((f, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => handleFilterPress(idx)}
            style={[
              styles.filterBtn,
              activeFilter === idx && styles.activeFilter,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === idx && { color: '#000' },
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ marginTop: 24 }}>
        <Card
          icon="clipboard-list"
          title="Total de pedidos"
          value={`${filteredOrders.length}`}
        />

        {mostSold && (
          <Card
            icon="star"
            title="Producto más vendido"
            value={`${mostSold.name} × ${mostSold.total}`}
            valueColor="#ffd32a"
          />
        )}

        {mostExpensiveOrder?.orderNumber && (
          <Card
            icon="cash-multiple"
            title="Pedido más caro"
            value={
              <>
                <Text style={{ color: '#ecf0f1' }}>
                  #{mostExpensiveOrder.orderNumber} –{' '}
                </Text>
                <Text style={{ color: '#2ed573' }}>
                  ${parseMoney(mostExpensiveOrder.total).toFixed(2)}
                </Text>
              </>
            }
          />
        )}

        <Card
          icon="currency-usd"
          title="Total vendido"
          value={`$${totalRevenue.toFixed(2)}`}
          valueColor="#2ed573"
        />

        {filteredOrders.length === 0 && (
          <Text style={styles.empty}>No hay pedidos en este periodo.</Text>
        )}
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
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 1.5,
  },
  filterScroll: {
    gap: 12,
    paddingBottom: 6,
  },
  filterBtn: {
    backgroundColor: '#111',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginRight: 6,
  },
  activeFilter: {
    backgroundColor: '#2ed573',
  },
  filterText: {
    color: '#eee',
    fontWeight: '600',
    fontSize: 15,
  },
  card: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  empty: {
    color: '#777',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 40,
  },
});
