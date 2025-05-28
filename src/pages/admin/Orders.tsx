import { PostgrestError } from '@supabase/supabase-js';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye, RefreshCwIcon, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useTheme } from '../../contexts/ThemeContext';

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  total: number;
  status: string;
  created_at: string;
  items?: OrderItem[];
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export default function Orders() {
  const { supabase } = useSupabase();
  const { isDarkMode } = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteOption, setDeleteOption] = useState('30');
  
  // Classes condicionais baseadas no tema
  const cardBg = isDarkMode ? 'bg-[#2C1A10]' : 'bg-white';
  const cardBorder = isDarkMode ? 'border-[#3C2A1F]' : 'border-gray-200';
  const textColor = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const headerColor = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const modalBg = isDarkMode ? 'bg-[#2C1A10]' : 'bg-white';
  
  useEffect(() => {
    fetchOrders();
  }, []);
  
  async function fetchOrders() {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setOrders(data || []);
    } catch (error) {
      if (error instanceof PostgrestError) {
        console.error('Erro ao buscar pedidos:', error.message);
        setError(`Falha ao carregar pedidos: ${error.message}`);
      } else {
        console.error('Erro ao buscar pedidos:', error);
        setError('Falha ao carregar pedidos. Por favor, tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }
  
  async function fetchOrderDetails(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('id, product_name, quantity, price')
        .eq('order_id', orderId);
        
      if (error) {
        throw error;
      }
      
      // Calculate subtotal for each item
      const itemsWithSubtotal = data.map(item => ({
        ...item,
        subtotal: item.quantity * item.price
      }));
      
      return itemsWithSubtotal;
    } catch (error) {
      console.error('Erro ao buscar detalhes do pedido:', error);
      return [];
    }
  }
  
  async function handleViewDetails(order: Order) {
    setSelectedOrder(order);
    
    // Fetch order items
    const items = await fetchOrderDetails(order.id);
    setSelectedOrder(prev => prev ? { ...prev, items } : null);
    
    setShowDetails(true);
  }
  
  async function handleStatusChange(orderId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
    }
  }
  
  async function handleDeleteHistory() {
    try {
      let query = supabase
        .from('orders')
        .select('id, created_at, status');

      // Se não for "all", aplica o filtro de data
      if (deleteOption !== 'all') {
        const daysAgo = parseInt(deleteOption);
        const cutoffDate = subDays(new Date(), daysAgo).toISOString();
        console.log('Data de corte:', cutoffDate);
        query = query.lt('created_at', cutoffDate);
      }

      // Buscar os IDs dos pedidos que serão deletados
      const { data: ordersToDelete, error: fetchError } = await query;

      console.log('Pedidos encontrados para deletar:', ordersToDelete);

      if (fetchError) {
        console.error('Erro ao buscar pedidos:', fetchError);
        throw fetchError;
      }

      if (!ordersToDelete || ordersToDelete.length === 0) {
        console.log('Nenhum pedido encontrado para excluir');
        setError('Nenhum pedido encontrado para excluir neste período.');
        setShowDeleteModal(false);
        return;
      }

      const orderIds = ordersToDelete.map(order => order.id);
      console.log('IDs dos pedidos para deletar:', orderIds);

      // Deletar os itens dos pedidos primeiro
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .in('order_id', orderIds);

      if (itemsError) {
        console.error('Erro ao deletar itens:', itemsError);
        throw itemsError;
      }

      console.log('Itens dos pedidos deletados com sucesso');

      // Depois deletar os pedidos
      const { error: ordersError } = await supabase
        .from('orders')
        .delete()
        .in('id', orderIds);

      if (ordersError) {
        console.error('Erro ao deletar pedidos:', ordersError);
        throw ordersError;
      }

      console.log('Pedidos deletados com sucesso');

      // Atualiza a lista de pedidos e fecha o modal
      await fetchOrders();
      setShowDeleteModal(false);
      setError(null); // Limpa qualquer erro anterior
    } catch (error) {
      if (error instanceof PostgrestError) {
        console.error('Erro ao excluir histórico:', error.message);
        setError(`Falha ao excluir histórico: ${error.message}`);
      } else {
        console.error('Erro ao excluir histórico:', error);
        setError('Falha ao excluir histórico. Por favor, tente novamente.');
      }
    }
  }
  
  function formatDate(dateString: string) {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  }
  
  function getStatusBadgeClass(status: string) {
    switch (status) {
      case 'pending':
        return 'bg-yellow-900 text-yellow-200';
      case 'processing':
        return 'bg-blue-900 text-blue-200';
      case 'completed':
        return 'bg-green-900 text-green-200';
      case 'cancelled':
        return 'bg-red-900 text-red-200';
      default:
        return 'bg-gray-900 text-gray-200';
    }
  }
  
  function getStatusLabel(status: string) {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'processing':
        return 'Processando';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className={`text-2xl font-bold ${headerColor}`}>Histórico de Pedidos</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded transition-colors"
          >
            <Trash2 size={16} />
            Limpar Histórico
          </button>
          <button 
            onClick={fetchOrders}
            className="flex items-center gap-2 bg-[#e67e22] hover:bg-[#d35400] text-white px-3 py-1.5 rounded transition-colors"
          >
            <RefreshCwIcon size={16} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-900 text-red-200 p-3 rounded">
          {error}
        </div>
      )}
      
      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#2a211c] rounded-lg border border-[#5a443c] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-[#5a443c] flex justify-between items-center">
              <h2 className="text-xl font-semibold">Detalhes do Pedido #{selectedOrder.id}</h2>
              <button 
                onClick={() => setShowDetails(false)}
                className="p-1 hover:bg-[#46342e] rounded-full transition-colors"
              >
                <Eye size={20} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm text-gray-400">Cliente</h3>
                  <p>{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-400">Telefone</h3>
                  <p>{selectedOrder.customer_phone || 'Não informado'}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-400">Data</h3>
                  <p>{formatDate(selectedOrder.created_at)}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-400">Status</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusBadgeClass(selectedOrder.status)}`}>
                      {getStatusLabel(selectedOrder.status)}
                    </span>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                      className="bg-[#46342e] border border-[#5a443c] rounded p-1 text-sm"
                    >
                      <option value="pending">Pendente</option>
                      <option value="processing">Processando</option>
                      <option value="completed">Concluído</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Itens do Pedido</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#5a443c]">
                        <th className="py-2 text-left">Produto</th>
                        <th className="py-2 text-center">Qtd</th>
                        <th className="py-2 text-right">Preço</th>
                        <th className="py-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item) => (
                          <tr key={item.id} className="border-b border-[#5a443c]">
                            <td className="py-2">{item.product_name}</td>
                            <td className="py-2 text-center">{item.quantity}</td>
                            <td className="py-2 text-right">R$ {item.price.toFixed(2)}</td>
                            <td className="py-2 text-right">R$ {item.subtotal.toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-gray-400">
                            Nenhum item encontrado
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="py-2 text-right font-medium">Total</td>
                        <td className="py-2 text-right font-medium">R$ {selectedOrder.total.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-[#5a443c] flex justify-end">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 bg-[#46342e] hover:bg-[#5a443c] rounded transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Confirmação de Exclusão do Histórico */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${modalBg} p-6 rounded-lg shadow-lg max-w-md w-full z-10`}>
            <h3 className={`text-lg font-semibold mb-4 ${headerColor}`}>Limpar Histórico de Pedidos</h3>
            <p className={`mb-4 ${textColor}`}>
              Selecione o período de pedidos que deseja excluir. Esta ação não pode ser desfeita e não afetará pedidos pendentes.
            </p>
            
            <div className="mb-6">
              <label htmlFor="deleteOption" className={`block mb-2 text-sm ${textColor}`}>
                Excluir pedidos mais antigos que:
              </label>
              <select
                id="deleteOption"
                value={deleteOption}
                onChange={(e) => setDeleteOption(e.target.value)}
                className={`w-full p-2 ${cardBg} border ${cardBorder} rounded focus:outline-none focus:border-[#e67e22]`}
              >
                <option value="7">7 dias</option>
                <option value="15">15 dias</option>
                <option value="30">30 dias</option>
                <option value="60">60 dias</option>
                <option value="90">90 dias</option>
                <option value="180">6 meses</option>
                <option value="365">1 ano</option>
                <option value="all">Tudo</option>
              </select>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`px-4 py-2 ${cardBg} border ${cardBorder} rounded hover:bg-opacity-80 transition-colors`}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteHistory}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Orders List */}
      <div className="bg-[#2a211c] rounded-lg border border-[#5a443c] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#5a443c]">
                <th className="py-3 px-4 text-left">Pedido</th>
                <th className="py-3 px-4 text-left">Cliente</th>
                <th className="py-3 px-4 text-left">Data</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading && !orders.length ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    Carregando pedidos...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    Nenhum pedido encontrado
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-[#5a443c]">
                    <td className="py-3 px-4">{`#${order.id}`}</td>
                    <td className="py-3 px-4">{order.customer_name}</td>
                    <td className="py-3 px-4">{formatDate(order.created_at)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusBadgeClass(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">R$ {order.total.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="p-1 hover:bg-[#46342e] rounded transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 