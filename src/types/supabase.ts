export interface Database {
  public: {
    Tables: {
      token_counter: {
        Row: {
          id: number;
          date: string;
          last_number: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          date: string;
          last_number?: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          date?: string;
          last_number?: number;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          customer_name: string;
          status: 'pending' | 'paid' | 'completed' | 'cancelled';
          total: number;
          token: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          status: 'pending' | 'paid' | 'completed' | 'cancelled';
          total: number;
          token: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_name?: string;
          status?: 'pending' | 'paid' | 'completed' | 'cancelled';
          total?: number;
          token?: string;
          created_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          product_name: string;
          quantity: number;
          price: number;
          subtotal: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          product_name: string;
          quantity: number;
          price: number;
          subtotal: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          product_name?: string;
          quantity?: number;
          price?: number;
          subtotal?: number;
          created_at?: string;
        };
      };
    };
  };
} 