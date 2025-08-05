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

  // Cargar menú guardado al iniciar
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

  // Guardar menú cada vez que cambie
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

  // Agregar o editar producto
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

    if (editingId) {
      // Editar producto existente
      setMenu((current) =>
        current.map((p) =>
          p.id === editingId ? { ...p, name: nameInput, price } : p
        )
      );
      setEditingId(null);
    } else {
      // Agregar nuevo producto
      const newProduct: Product = {
        id: Math.random().toString(36).substring(2, 9),
        name: nameInput,
        price,
      };
      setMenu((current) => [...current, newProduct]);
    }

    setNameInput('');
    setPriceInput('');
  };

  // Eliminar producto
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

  // Editar producto
  const startEditing = (product: Product) => {
    setNameInput(product.name);
    setPriceInput(product.price.toString());
    setEditingId(product.id);
  };

  // Cancelar edición
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Text style={styles.title}>Gestionar asdasdsaMenú</Text>

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
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={cancelEditing}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={[styles.button, styles.addButton]} onPress={saveProduct}>
            <Text style={styles.buttonText}>Agregar</Text>
          </TouchableOpacity>
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
    marginTop: 12,
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
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
  buttonText: {
    color: colors.inputText,
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
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
