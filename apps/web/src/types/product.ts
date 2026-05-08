export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  isActive?: boolean;
}

/** Item de carrito tanto en mostrador como en cierre de servicio. */
export interface CartItem {
  product: Product;
  quantity: number;
}
