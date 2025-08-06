import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
  Animated,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { colors } from '../../styles/colors';

type Product = {
  id: string;
  name: string;
  price: number;
};

export default function ManageMenuScreen() {
  const [menu, setMenu] = useState<Product[]>([]);
  const [nameInput, setNameInput] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const modalY = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const loadMenu = async () => {
      const json = await AsyncStorage.getItem('menu');
      if (json) setMenu(JSON.parse(json));
    };
    loadMenu();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('menu', JSON.stringify(menu));
  }, [menu]);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener('keyboardDidShow', () => {
      Animated.timing(modalY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
    const keyboardWillHide = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(modalY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const openForm = () => {
    setNameInput('');
    setPriceInput('');
    setEditingId(null);
    setShowModal(true);
  };

  const saveProduct = () => {
    if (nameInput.trim() === '' || priceInput.trim() === '') {
      Alert.alert('Error', 'Por favor ingresa nombre y precio válidos');
      return;
    }

    const price = parseFloat(priceInput);

    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Ingresa un precio válido mayor a 0');
      return;
    }

    const formattedName =
      nameInput.toLowerCase().replace(/\s+/g, ' ').trim().replace(/^./, (c) => c.toUpperCase());

    if (editingId) {
      setMenu((m) =>
        m.map((p) =>
          p.id === editingId ? { ...p, name: formattedName, price } : p
        )
      );
    } else {
      setMenu((m) => [
        ...m,
        { id: Math.random().toString(36).substring(2, 9), name: formattedName, price },
      ]);
    }

    setShowModal(false);
  };

  const deleteAll = () => {
    if (!menu.length) {
      Alert.alert('No hay productos', 'El menú ya está vacío.');
      return;
    }
    Alert.alert('Eliminar todo', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => setMenu([]) },
    ]);
  };

  const startEditing = (product: Product) => {
    setNameInput(product.name);
    setPriceInput(product.price.toString());
    setEditingId(product.id);
    setShowModal(true);
  };

  const deleteProduct = (id: string) => setMenu((m) => m.filter((p) => p.id !== id));

  const renderItem = ({ item }: { item: Product }) => (
    <Swipeable
      renderRightActions={() => (
        <View style={styles.swipeContainer}>
          <TouchableOpacity onPress={() => deleteProduct(item.id)} style={styles.swipeDelete}>
            <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.inputText} />
          </TouchableOpacity>
        </View>
      )}
    >
      <TouchableOpacity style={styles.itemContainer} onPress={() => startEditing(item)}>
        <View>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
        </View>
        <MaterialCommunityIcons name="pencil-outline" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          <View style={styles.headerRow}>
            <Text style={styles.title}>Gestionar Menú</Text>
          </View>

          {menu.length === 0 ? (
            <Text style={styles.emptyText}>No hay productos en el menú.</Text>
          ) : (
            <FlatList
              data={menu}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 100 }}
              style={{ marginTop: 16 }}
            />
          )}

          <View style={styles.floatingButtons}>
            <TouchableOpacity style={styles.actionBtnRed} onPress={deleteAll}>
              <MaterialCommunityIcons name="trash-can" size={24} color={colors.inputText} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={openForm}>
              <MaterialCommunityIcons name="plus" size={28} color={colors.inputText} />
            </TouchableOpacity>
          </View>

          <Modal visible={showModal} transparent animationType="fade">
            <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <Animated.View style={[styles.modalContent, { transform: [{ translateY: modalY }] }]}>
                    <Text style={styles.modalTitle}>{editingId ? 'Editar producto' : 'Nuevo producto'}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Nombre"
                      placeholderTextColor={colors.placeholderText}
                      value={nameInput}
                      onChangeText={setNameInput}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Precio"
                      placeholderTextColor={colors.placeholderText}
                      value={priceInput}
                      onChangeText={(text) => {
                        // Limitar a números y punto decimal solamente
                        const cleaned = text.replace(/[^0-9.]/g, '');
                        setPriceInput(cleaned);
                      }}
                      keyboardType="numeric"
                    />

                    <View style={styles.modalButtonsRow}>
                      <TouchableOpacity style={styles.modalBtnRed} onPress={() => setShowModal(false)}>
                        <MaterialCommunityIcons name="close" size={24} color="#fff" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.modalBtnGreen} onPress={saveProduct}>
                        <MaterialCommunityIcons name="check" size={24} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 40,
  },
  itemContainer: {
    backgroundColor: colors.orderPanelBackground,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  itemPrice: {
    color: colors.textMuted,
    fontSize: 16,
  },
  floatingButtons: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    flexDirection: 'row',
    gap: 14,
  },
  actionBtn: {
    backgroundColor: colors.buttonAdd,
    padding: 14,
    borderRadius: 50,
  },
  actionBtnRed: {
    backgroundColor: colors.buttonDelete,
    padding: 14,
    borderRadius: 50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: colors.orderPanelBackground,
    padding: 20,
    borderRadius: 16,
    width: '100%',
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.inputBackground,
    color: colors.inputText,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalBtnRed: {
    flex: 1,
    backgroundColor: colors.buttonDelete,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalBtnGreen: {
    flex: 1,
    backgroundColor: colors.buttonAdd,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  swipeContainer: {
    justifyContent: 'center',
    marginVertical: 6,
  },
  swipeDelete: {
    backgroundColor: colors.buttonDelete,
    justifyContent: 'center',
    alignItems: 'center',
    width: 54,
    borderRadius: 12,
    height: 54,
  },
});
