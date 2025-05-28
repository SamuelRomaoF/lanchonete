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
  created_at: string;
  updated_at: string;
} 