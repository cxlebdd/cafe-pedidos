import React, { useState } from 'react';
import { FlatList, TouchableOpacity, View, Text } from 'react-native';
import { mockMenu, Product } from '../data/mockMenu';

export default function TakeOrderScreen() {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const toggleSelectProduct = (id: string) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter(pid => pid !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  const renderItem = ({ item }: { item: Product }) => {
    const isSelected = selectedProducts.includes(item.id);
    return (
      <TouchableOpacity
        onPress={() => toggleSelectProduct(item.id)}
        className={`p-4 mb-2 rounded-lg ${isSelected ? 'bg-red-600' : 'bg-neutral-800'}`}
      >
        <Text className="text-white text-lg">{item.name}</Text>
        <Text className="text-gray-300">${item.price}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-neutral-900 p-4">
      <Text className="text-white text-2xl font-bold mb-4">Selecciona productos</Text>

      <FlatList
        data={mockMenu}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}
