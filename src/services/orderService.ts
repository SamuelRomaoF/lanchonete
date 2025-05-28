import { supabase } from '../config/supabase';
import { Order, OrderItem } from '../types/order';
import { CartItem } from '../types';
import { generateDailyToken } from '../utils/tokenGenerator';

export const orderService = {
  async createOrder(customerName: string, cartItems: CartItem[]): Promise<Order> {
    try {
      const token = await generateDailyToken();
      const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

      // Criar o pedido primeiro
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: customerName,
          status: 'pending',
          total,
          token
        })
        .select()
        .single();

      if (orderError) {
        console.error('Erro detalhado:', orderError);
        throw new Error('Erro ao criar pedido');
      }

      if (!orderData) {
        throw new Error('Pedido não foi criado');
      }

      // Criar os itens do pedido
      const orderItems = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        subtotal: item.product.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Erro ao criar itens do pedido:', itemsError);
        throw new Error('Erro ao criar itens do pedido');
      }

      return {
        ...orderData,
        items: orderItems
      };
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      throw error;
    }
  },

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      console.error('Erro ao atualizar status:', error);
      throw new Error('Erro ao atualizar status do pedido: ' + error.message);
    }
  },

  async getOrderByToken(token: string): Promise<Order | null> {
    // Buscar o pedido e seus itens em uma única consulta
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items (
          id,
          product_id,
          product_name,
          quantity,
          price,
          subtotal,
          created_at
        )
      `)
      .eq('token', token)
      .single();

    if (orderError) {
      console.error('Erro ao buscar pedido:', orderError);
      throw new Error('Erro ao buscar pedido: ' + orderError.message);
    }

    if (!orderData) {
      return null;
    }

    return orderData as Order;
  },

  async getCustomerOrders(customerName: string): Promise<Order[]> {
    try {
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('customer_name', customerName)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Erro ao buscar pedidos:', ordersError);
        throw new Error('Erro ao buscar pedidos');
      }

      return orders || [];
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      throw error;
    }
  }
}; 