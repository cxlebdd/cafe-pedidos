import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  Pressable,
  TouchableOpacity,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { colors } from '../../styles/colors';

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
  finishedAt?: string;
};

export default function HistorialScreen() {
  const [historial, setHistorial] = useState<Order[]>([]);

  const loadHistorial = async () => {
    try {
      const data = await AsyncStorage.getItem('pedidosHistorial');
      if (data) setHistorial(JSON.parse(data));
    } catch (err) {
      console.error('Error al cargar historial:', err);
    }
  };

  useEffect(() => {
    loadHistorial();
  }, []);

  const eliminarPedido = (id: string) => {
    Alert.alert(
      'Eliminar pedido',
      '¿Seguro que quieres eliminar este pedido permanentemente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const nuevoHistorial = historial.filter((o) => o.id !== id);
              setHistorial(nuevoHistorial);
              await AsyncStorage.setItem('pedidosHistorial', JSON.stringify(nuevoHistorial));
            } catch (error) {
              console.error('Error al eliminar pedido:', error);
            }
          },
        },
      ]
    );
  };

  const borrarTodo = () => {
    Alert.alert(
      'Borrar todo el historial',
      '¿Seguro que quieres borrar todo el historial de pedidos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar todo',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('pedidosHistorial');
              setHistorial([]);
            } catch (error) {
              console.error('Error al borrar historial:', error);
            }
          },
        },
      ]
    );
  };

  const exportarJSON = async () => {
    try {
      if (historial.length === 0) {
        Alert.alert('Sin datos', 'No hay pedidos para exportar.');
        return;
      }

      const fileName = `historial_pedidos_${Date.now()}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(historial, null, 2), {
        encoding: FileSystem.EncodingType.UTF8,
      });

      Alert.alert(
        'Archivo exportado',
        `El historial se guardó como:\n${fileName}`,
        [
          { text: 'OK' },
        ]
      );

      // Opcional: abrir carpeta con FileSystem.getContentUriAsync si lo necesitas
    } catch (error) {
      console.error('Error al exportar JSON:', error);
      Alert.alert('Error', 'No se pudo exportar el historial.');
    }
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <Pressable
      onLongPress={() => eliminarPedido(item.id)}
      delayLongPress={700}
      style={({ pressed }) => [
        styles.orderCard,
        pressed && { opacity: 0.7 },
      ]}
    >
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
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {historial.length === 0 ? (
        <Text style={styles.emptyText}>No hay pedidos finalizados.</Text>
      ) : (
        <>
          <FlatList
            data={historial}
            renderItem={renderOrder}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 80 }}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.exportBtn} onPress={exportarJSON}>
              <Text style={styles.exportText}>Exportar JSON</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.clearAllBtn} onPress={borrarTodo}>
              <Text style={styles.clearAllText}>Borrar historial</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  orderCard: {
    backgroundColor: colors.surfaceDark,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.surface,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderTitle: {
    color: colors.textLight,
    fontWeight: '700',
    fontSize: 16,
  },
  orderTime: {
    color: colors.textMuted,
    fontSize: 14,
  },
  orderTotal: {
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  itemsList: {
    borderTopWidth: 1,
    borderTopColor: colors.surface,
    paddingTop: 8,
    marginTop: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  itemName: {
    color: colors.textLight,
    fontSize: 15,
  },
  itemPrice: {
    color: colors.textMedium,
    fontSize: 15,
  },
  noteText: {
    color: colors.textMuted,
    fontStyle: 'italic',
    fontSize: 13,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  exportBtn: {
    flex: 1,
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  exportText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  clearAllBtn: {
    flex: 1,
    backgroundColor: colors.danger,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  clearAllText: {
    color: colors.textLight,
    fontWeight: '700',
    fontSize: 16,
  },
});
