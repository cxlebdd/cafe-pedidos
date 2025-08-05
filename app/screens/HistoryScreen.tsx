import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
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
  finishedAt?: string; // opcional, si quieres mostrar cuándo se finalizó
};

export default function HistorialScreen() {
  const [historial, setHistorial] = useState<Order[]>([]);

  const loadHistorial = async () => {
    try {
      const data = await AsyncStorage.getItem('pedidosHistorial');
      if (data) {
        setHistorial(JSON.parse(data));
      }
    } catch (err) {
      console.error('Error al cargar historial:', err);
    }
  };

  useEffect(() => {
    loadHistorial();
  }, []);

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderTitle}>Pedido #{item.orderNumber}</Text>
        <Text style={styles.orderTime}>
          {new Date(item.createdAt).toLocaleString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </Text>
      </View>

      <Text style={styles.orderTotal}>Total: {item.total}</Text>

      <View style={styles.itemsList}>
        {item.items.map((i) => (
          <View key={i.product.id} style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>
                {i.product.name} x{i.quantity}
              </Text>
              {!!i.notes.trim() && (
                <Text style={styles.noteText}>Nota: {i.notes}</Text>
              )}
            </View>
            <Text style={styles.itemPrice}>
              ${(i.product.price * i.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {historial.length === 0 ? (
        <Text style={styles.emptyText}>No hay pedidos finalizados.</Text>
      ) : (
        <FlatList
          data={historial}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
  },
  emptyText: {
    color: '#777',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  orderCard: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderTitle: {
    color: '#ecf0f1',
    fontWeight: '700',
    fontSize: 16,
  },
  orderTime: {
    color: '#888',
    fontSize: 14,
  },
  orderTotal: {
    color: '#27ae60',
    fontWeight: '600',
    marginBottom: 8,
  },
  itemsList: {
    borderTopWidth: 1,
    borderTopColor: '#222',
    paddingTop: 8,
    marginTop: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  itemName: {
    color: '#ecf0f1',
    fontSize: 15,
  },
  itemPrice: {
    color: '#ccc',
    fontSize: 15,
  },
  noteText: {
    color: '#aaa',
    fontStyle: 'italic',
    fontSize: 13,
  },
});
