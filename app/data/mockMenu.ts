// app/data/mockMenu.ts

// Definimos la estructura de un producto
export interface Product {
  id: string;     // ID único para identificar el producto
  name: string;   // Nombre del producto (ej. "Espresso")
  price: number;  // Precio en pesos mexicanos, por ejemplo
}

// Aquí simulamos un menú con algunos productos
export const mockMenu: Product[] = [
  { id: '1', name: 'Espresso', price: 25 },
  { id: '2', name: 'Cappuccino', price: 35 },
  { id: '3', name: 'Latte', price: 40 },
  { id: '4', name: 'Americano', price: 30 },
  { id: '5', name: 'Moka', price: 45 },
];

