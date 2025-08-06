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
} from 'react-native';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

  const formatProductName = (text: string) => {
    const cleaned = text.toLowerCase().replace(/\s+/g, ' ').trim();
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  };

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const json = await AsyncStorage.getItem('menu');
        if (json) {
          setMenu(JSON.parse(json));
        }
      } catch (e) {
        console.error('Error cargando menú:', e);
      }
    };
    loadMenu();
  }, []);

  useEffect(() => {
    const saveMenu = async () => {
      try {
        await AsyncStorage.setItem('menu', JSON.stringify(menu));
      } catch (e) {
        console.error('Error guardando menú:', e);
      }
    };
    saveMenu();
  }, [menu]);

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

    const formattedName = formatProductName(nameInput);

    if (editingId) {
      setMenu((current) =>
        current.map((p) =>
          p.id === editingId ? { ...p, name: formattedName, price } : p
        )
      );
      setEditingId(null);
    } else {
      const newProduct: Product = {
        id: Math.random().toString(36).substring(2, 9),
        name: formattedName,
        price,
      };
      setMenu((current) => [...current, newProduct]);
    }

    setNameInput('');
    setPriceInput('');
    Keyboard.dismiss();
  };

  const deleteAll = () => {
    if (menu.length === 0) {
      Alert.alert('No hay productos', 'El menú ya está vacío.');
      return;
    }
    Alert.alert(
      'Eliminar todo',
      '¿Estás seguro de que quieres borrar todo el menú?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar todo',
          style: 'destructive',
          onPress: () => setMenu([]),
        },
      ]
    );
  };

  const deleteProduct = (id: string) => {
    Alert.alert(
      'Eliminar producto',
      '¿Seguro que quieres eliminar este producto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setMenu((current) => current.filter((p) => p.id !== id));
          },
        },
      ]
    );
  };

  const startEditing = (product: Product) => {
    setNameInput(product.name);
    setPriceInput(product.price.toString());
    setEditingId(product.id);
  };

  const cancelEditing = () => {
    setNameInput('');
    setPriceInput('');
    setEditingId(null);
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.itemContainer}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
      </View>
      <TouchableOpacity onPress={() => startEditing(item)} style={styles.iconBtn}>
        <MaterialCommunityIcons name="pencil-outline" size={26} color={colors.buttonNote} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteProduct(item.id)} style={styles.iconBtn}>
        <MaterialCommunityIcons name="trash-can-outline" size={26} color={colors.buttonDelete} />
      </TouchableOpacity>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <Text style={styles.title}>Gestionar Menú</Text>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Nombre del producto"
            placeholderTextColor={colors.placeholderText}
            value={nameInput}
            onChangeText={setNameInput}
          />
          <TextInput
            style={[styles.input, { width: 100, marginLeft: 8 }]}
            placeholder="Precio"
            placeholderTextColor={colors.placeholderText}
            value={priceInput}
            onChangeText={setPriceInput}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.buttonsRow}>
          {editingId ? (
            <>
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={saveProduct}>
                <MaterialCommunityIcons name="content-save-outline" size={20} color={colors.inputText} />
                <Text style={styles.buttonText}> Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={cancelEditing}>
                <MaterialCommunityIcons name="close-circle-outline" size={20} color={colors.inputText} />
                <Text style={styles.buttonText}> Cancelar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={[styles.button, styles.deleteAllButton]} onPress={deleteAll}>
                <MaterialCommunityIcons name="delete-sweep-outline" size={20} color={colors.inputText} />
                <Text style={styles.buttonText}> Eliminar todo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.addButton]} onPress={saveProduct}>
                <MaterialCommunityIcons name="plus" size={20} color={colors.inputText} />
                <Text style={styles.buttonText}> Agregar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {menu.length === 0 ? (
          <Text style={styles.emptyText}>No hay productos en el menú.</Text>
        ) : (
          <FlatList
            data={menu}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 80 }}
            style={{ marginTop: 16 }}
          />
        )}
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
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
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
  },
  input: {
    flex: 1,
    backgroundColor: colors.inputBackground,
    color: colors.inputText,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  addButton: {
    backgroundColor: colors.buttonAdd,
  },
  saveButton: {
    backgroundColor: colors.buttonAdd,
  },
  cancelButton: {
    backgroundColor: colors.buttonDelete,
  },
  deleteAllButton: {
    backgroundColor: colors.buttonDelete,
  },
  buttonText: {
    color: colors.inputText,
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 6,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: colors.orderPanelBackground,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
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
  iconBtn: {
    marginLeft: 12,
  },
  emptyText: {
    color: colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 40,
  },
});
