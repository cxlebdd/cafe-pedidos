import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  Animated,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { mockMenu, Product } from '../data/mockMenu';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { colors } from '../../styles/colors';

type SelectedProduct = {
  product: Product;
  quantity: number;
  notes: string;
};

export default function TakeOrderScreen() {
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentNoteProductId, setCurrentNoteProductId] = useState<string | null>(null);
  const [noteInputValue, setNoteInputValue] = useState('');
  const [searchText, setSearchText] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const panelHeight = useRef(new Animated.Value(60)).current;
  const insets = useSafeAreaInsets();

  const noteInputRef = useRef<TextInput>(null);

  const filteredMenu = mockMenu.filter((product) =>
    product.name.toLowerCase().includes(searchText.toLowerCase())
  );

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const addProduct = (product: Product) => {
    setSelectedProducts((current) => {
      const existing = current.find((p) => p.product.id === product.id);
      if (existing) {
        return current.map((p) =>
          p.product.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      } else {
        return [...current, { product, quantity: 1, notes: '' }];
      }
    });
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts((current) => {
      const existing = current.find((p) => p.product.id === productId);
      if (!existing) return current;

      if (existing.quantity === 1) {
        return current.filter((p) => p.product.id !== productId);
      } else {
        return current.map((p) =>
          p.product.id === productId ? { ...p, quantity: p.quantity - 1 } : p
        );
      }
    });
  };

  const deleteProduct = (productId: string) => {
    setSelectedProducts((current) => current.filter((p) => p.product.id !== productId));
  };

  const deleteAllProducts = () => {
    Alert.alert(
      'Eliminar todo',
      '¿Estás seguro que quieres eliminar todos los productos del pedido?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => setSelectedProducts([]) },
      ]
    );
  };

  const openNoteModal = (productId: string) => {
    const product = selectedProducts.find((p) => p.product.id === productId);
    if (product) {
      setNoteInputValue(product.notes);
      setCurrentNoteProductId(productId);
      setModalVisible(true);
      setTimeout(() => noteInputRef.current?.focus(), 100);
    }
  };

  const saveNote = () => {
    if (currentNoteProductId) {
      setSelectedProducts((current) =>
        current.map((p) =>
          p.product.id === currentNoteProductId ? { ...p, notes: noteInputValue } : p
        )
      );
    }
    setModalVisible(false);
    setCurrentNoteProductId(null);
    setNoteInputValue('');
  };

  const total = selectedProducts.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const formatTotal = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(total);

  useEffect(() => {
    Animated.timing(panelHeight, {
      toValue: panelOpen ? 360 + insets.bottom : 60 + insets.bottom / 2,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [panelOpen, insets.bottom]);

  const submitOrder = () => {
    if (selectedProducts.length === 0) {
      Alert.alert('Pedido vacío', 'Por favor, agrega al menos un producto');
      return;
    }

    Alert.alert(
      'Confirmar envío',
      `¿Confirmas enviar el pedido por ${formatTotal}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

              const existingData = await AsyncStorage.getItem('pedidos');
              const existingOrders = existingData ? JSON.parse(existingData) : [];

              // Filtrar pedidos del día de hoy
              const pedidosHoy = existingOrders.filter(
                (p: any) => p.createdAt.slice(0, 10) === today
              );

              // Número correlativo para el pedido
              const newOrderNumber = pedidosHoy.length + 1;

              const newOrder = {
                id: uuidv4(),                // ID único
                orderNumber: newOrderNumber, // para mostrar en UI (puede repetirse)
                items: selectedProducts,
                total: formatTotal,
                createdAt: new Date().toISOString(),
              };

              const updatedOrders = [...existingOrders, newOrder];

              await AsyncStorage.setItem('pedidos', JSON.stringify(updatedOrders));

              Alert.alert('Pedido enviado', `Has enviado un pedido por ${formatTotal}`);

              setSelectedProducts([]);
              setPanelOpen(false);
            } catch (err) {
              Alert.alert('Error', 'Hubo un problema al guardar el pedido');
              console.error(err);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderMenuItem = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.menuItem} onPress={() => addProduct(item)}>
      <Text style={styles.menuItemName}>{item.name}</Text>
      <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  const renderSelectedItem = ({ item }: { item: SelectedProduct }) => (
    <View style={styles.selectedItem}>
      <View style={styles.selectedItemRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.selectedItemName}>{item.product.name}</Text>
          <Text style={styles.quantityText}>x{item.quantity}</Text>
          {!!item.notes.trim() && (
            <Text style={styles.noteText}>Nota: {item.notes}</Text>
          )}
        </View>

        <Text style={styles.priceMuted}>
          ${(item.product.price * item.quantity).toFixed(2)}
        </Text>
      </View>

      <View style={styles.selectedItemButtonsRow}>
        <TouchableOpacity onPress={() => removeProduct(item.product.id)} style={styles.iconBtn}>
          <MaterialCommunityIcons name="minus-circle-outline" size={26} color={colors.buttonRemove} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => addProduct(item.product)} style={styles.iconBtn}>
          <MaterialCommunityIcons name="plus-circle-outline" size={26} color={colors.buttonAdd} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => openNoteModal(item.product.id)} style={styles.iconBtn}>
          <MaterialCommunityIcons name="pencil-outline" size={26} color={colors.buttonNote} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => deleteProduct(item.product.id)} style={styles.iconBtn}>
          <MaterialCommunityIcons name="trash-can-outline" size={26} color={colors.buttonDelete} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar producto..."
        placeholderTextColor={colors.placeholderText}
        value={searchText}
        onChangeText={setSearchText}
      />

      {filteredMenu.length === 0 ? (
        <Text style={styles.emptyOrderText}>No se encontraron productos</Text>
      ) : (
        <FlatList
          data={filteredMenu}
          renderItem={renderMenuItem}
          keyExtractor={(item) => item.id}
          style={styles.menuList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      {selectedProducts.length > 0 && (
        <Animated.View style={[styles.orderPanel, { height: panelHeight }]}>
          <TouchableOpacity
            style={[styles.orderPanelHeader, { paddingBottom: insets.bottom / 2 }]}
            activeOpacity={0.7}
            onPress={() => setPanelOpen((v) => !v)}
          >
            <Text style={styles.orderPanelTitle}>Pedido actual</Text>
            <Text style={styles.orderPanelTotal}>{formatTotal}</Text>
            <Text style={styles.orderPanelIcon}>{panelOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {panelOpen && (
            <>
              <FlatList
                data={selectedProducts}
                renderItem={renderSelectedItem}
                keyExtractor={(item) => item.product.id}
                style={styles.selectedList}
                showsVerticalScrollIndicator={true}
                extraData={selectedProducts}
              />

              <View style={styles.orderFooter}>
                <TouchableOpacity
                  style={[styles.iconBtnFooter, styles.clearAllBtn]}
                  onPress={deleteAllProducts}
                  accessibilityLabel="Eliminar todo"
                >
                  <MaterialCommunityIcons
                    name="delete-forever"
                    size={28}
                    color="#fff"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.iconBtnFooter, styles.submitBtn]}
                  onPress={submitOrder}
                  disabled={selectedProducts.length === 0}
                  accessibilityLabel="Agregar pedido"
                >
                  <MaterialCommunityIcons
                    name="check-circle-outline"
                    size={28}
                    color="#ecf0f1"
                  />
                </TouchableOpacity>
              </View>
            </>
          )}
        </Animated.View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[
            styles.modalOverlay,
            { justifyContent: keyboardVisible ? 'flex-start' : 'center' },
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.modalTitle}>Notas para el producto</Text>
            <TextInput
              ref={noteInputRef}
              style={styles.modalInput}
              placeholder="Escribe aquí tus notas..."
              multiline
              value={noteInputValue}
              onChangeText={setNoteInputValue}
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={() => noteInputRef.current?.blur()}
              placeholderTextColor={colors.placeholderText}
            />
            <TouchableOpacity style={styles.modalSaveBtn} onPress={saveNote}>
              <Text style={styles.modalSaveText}>Guardar Nota</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchInput: {
    backgroundColor: colors.inputBackground,
    color: colors.inputText,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 16,
  },
  emptyOrderText: {
    color: colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  menuList: {
    flexGrow: 0,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomColor: colors.borderColor,
    borderBottomWidth: 1,
  },
  menuItemName: {
    color: colors.textPrimary,
    fontSize: 18,
  },
  menuItemPrice: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  orderPanel: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    backgroundColor: colors.orderPanelBackground,
    borderRadius: 16,
    padding: 12,
    borderColor: colors.orderPanelBorder,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 18,
  },
  orderPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderPanelTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 20,
  },
  orderPanelTotal: {
    color: colors.priceGreen,
    fontWeight: '700',
    fontSize: 20,
  },
  orderPanelIcon: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 22,
  },
  selectedList: {
    marginTop: 8,
    maxHeight: 250,
  },
  selectedItem: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderBottomColor: colors.borderColorDark,
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
  },
  selectedItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedItemName: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  quantityText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  priceMuted: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 16,
    minWidth: 70,
    textAlign: 'right',
  },
  noteText: {
    color: colors.textNote,
    fontStyle: 'italic',
    marginTop: 4,
    fontSize: 14,
  },
  selectedItemButtonsRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  iconBtn: {
    paddingHorizontal: 6,
    marginRight: 12,
  },
  orderFooter: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 6,
    gap: 12,
  },
  iconBtnFooter: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearAllBtn: {
    backgroundColor: colors.buttonDelete,
  },
  submitBtn: {
    backgroundColor: colors.buttonAdd,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.modalOverlay,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: colors.modalBackground,
    borderRadius: 14,
    padding: 24,
    minWidth: '90%',
  },
  modalTitle: {
    fontSize: 20,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalInput: {
    height: 100,
    backgroundColor: colors.modalInputBackground,
    color: colors.inputText,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  modalSaveBtn: {
    backgroundColor: colors.modalSaveButton,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalSaveText: {
    color: colors.inputText,
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 16,
  },
  modalCancelBtn: {
    backgroundColor: 'transparent',
    borderColor: colors.modalCancelText,
    borderWidth: 2,
    paddingVertical: 12,
    borderRadius: 10,
  },
  modalCancelText: {
    color: colors.modalCancelText,
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 16,
  },
});
