import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        title,
        value,
        valueColor = '#ecf0f1',
        }: {
        title: string;
        value: string;
        valueColor?: string;
        }) => (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={[styles.cardValue, { color: valueColor }]}>{value}</Text>
        </View>
    );


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumen de ventas</Text>

      <View style={styles.grid}>
        {FILTERS.map((f, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => handleFilterPress(idx)}
            style={[
              styles.filterBtn,
              activeFilter === idx && styles.activeFilter,
            ]}
          >
            <Text style={styles.filterText}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ marginTop: 24 }}>
        <Card
          title="Total de pedidos"
          value={`${filteredOrders.length}`}
        />

        {mostSold && (
          <Card
            title="Producto más vendido"
            value={`${mostSold.name} × ${mostSold.total}`}
          />
        )}
        
        {mostExpensiveOrder?.orderNumber && (
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Pedido más caro</Text>
                <Text style={styles.cardValue}>
                #{mostExpensiveOrder.orderNumber} –{' '}
                <Text style={{ color: '#2ed573' }}>
                    ${parseMoney(mostExpensiveOrder.total).toFixed(2)}
                </Text>
                </Text>
            </View>
        )}
        <Card
            title="Total vendido"
            value={`$${totalRevenue.toFixed(2)}`}
            valueColor="#2ed573" // tu verde
        />
        {filteredOrders.length === 0 && (
          <Text style={styles.empty}>No hay pedidos en este periodo.</Text>
        )}     
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 1.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  filterBtn: {
    width: '48%',
    backgroundColor: '#111',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: '#2ed573',
  },
  filterText: {
    color: '#eee',
    fontWeight: '600',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  cardTitle: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 4,
  },
  cardValue: {
    color: '#ecf0f1',
    fontSize: 18,
    fontWeight: '700',
  },
  empty: {
    color: '#777',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 40,
  },
});
