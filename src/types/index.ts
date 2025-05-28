export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  is_featured: boolean;
  in_stock: boolean;
  is_on_sale: boolean;
  old_price?: number;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}