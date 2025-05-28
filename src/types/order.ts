import { Product } from './product';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
  created_at: string;
}

export interface Order {
  id: string;
  customer_name: string;
  total: number;
  token: string;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  created_at: string;
  items?: OrderItem[];
}

export interface StoredOrder {
  id: string;
  customerName: string;
  total: number;
  token: string;
  date: string;
  items: {
    product: {
      id: string;
      name: string;
      price: number;
      image_url?: string;
    };
    quantity: number;
  }[];
}

export type OrderStatus = Order['status']; 