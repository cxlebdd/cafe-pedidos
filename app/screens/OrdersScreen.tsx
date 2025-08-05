import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
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

export default function ViewOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);

  const loadOrders = async () => {
    try {
      const data = await AsyncStorage.getItem('pedidos');
      if (data) {
        setOrders(JSON.parse(data));
      }
    } catch (err) {
      console.error('Error al cargar pedidos:', err);
    }
  };

  const deleteOrder = (id: string) => {
  Alert.alert(
    'Marcar como listo',
    '¿Deseas marcar este pedido como listo? Ya no aparecerá en esta lista.',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Marcar como listo',
        onPress: async () => {
          try {
            // Filtrar pedido seleccionado
            const pedidoParaHistorial = orders.find((o) => o.id === id);
            if (!pedidoParaHistorial) return;

            // Quitar pedido de pedidos activos
            const updated = orders.filter((o) => o.id !== id);
            setOrders(updated);
            await AsyncStorage.setItem('pedidos', JSON.stringify(updated));

            // Cargar historial actual
            const historialData = await AsyncStorage.getItem('pedidosHistorial');
            const historial: Order[] = historialData ? JSON.parse(historialData) : [];

            // Agregar pedido al historial
            await AsyncStorage.setItem(
              'pedidosHistorial',
              JSON.stringify([pedidoParaHistorial, ...historial])
            );
          } catch (error) {
            console.error('Error al mover pedido al historial:', error);
          }
        },
        style: 'destructive',
      },
    ]
  );
};


  useEffect(() => {
  const fetchData = async () => {
    await loadOrders();
    };
    fetchData();
  }, []);


  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderTitle}>Pedido #{item.orderNumber}  </Text>
        <Text style={styles.orderTime}>
          {new Date(item.createdAt).toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
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

      <TouchableOpacity
        style={styles.doneButton}
        onPress={() => deleteOrder(item.id)}
      >
        <MaterialCommunityIcons name="check" size={20} color="#ecf0f1" />
        <Text style={styles.doneButtonText}> Marcar como listo</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {orders.length === 0 ? (
        <Text style={styles.emptyText}>No hay pedidos en preparación.</Text>
      ) : (
        <FlatList
          data={orders}
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
  doneButton: {
    flexDirection: 'row',
    marginTop: 12,
    backgroundColor: '#27ae60',
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#ecf0f1',
    fontWeight: '700',
    fontSize: 15,
  },
});
