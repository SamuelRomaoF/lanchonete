import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { Clock, ShoppingBag, RotateCcw, RefreshCw } from 'lucide-react';
import { Order } from '../types/order';
import { orderService } from '../services/orderService';
import { useAuth } from '../contexts/AuthContext';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isDarkMode } = useTheme();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    if (!user?.name) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orders = await orderService.getCustomerOrders(user.name);
      setOrders(orders);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      setError('Não foi possível carregar seus pedidos. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = (order: Order) => {
    if (!order.items) return;
    
    // Adicionar todos os itens do pedido ao carrinho
    order.items.forEach(item => {
      const product = {
        id: item.product_id.toString(),
        name: item.product_name,
        price: item.price,
        description: '',
        image_url: '',
        category_id: '0',
        is_featured: false,
        in_stock: true,
        is_on_sale: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      for (let i = 0; i < item.quantity; i++) {
        addToCart(product);
      }
    });
    navigate('/carrinho');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Histórico de Pedidos
        </h1>
        <div className="flex justify-center items-center py-12">
          <RefreshCw className={`w-8 h-8 animate-spin ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Histórico de Pedidos
        </h1>
        <div className={`text-center py-12 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>
          <p className="text-lg">{error}</p>
          <button
            onClick={fetchOrders}
            className="mt-4 inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!user?.name) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Histórico de Pedidos
        </h1>
        <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <p className="text-lg">Faça login para ver seu histórico de pedidos.</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Histórico de Pedidos
          </h1>
          <button
            onClick={fetchOrders}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
        <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <ShoppingBag className="w-12 h-12 mx-auto mb-4" />
          <p className="text-lg">Você ainda não fez nenhum pedido.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Histórico de Pedidos
        </h1>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>
      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className={`${
              isDarkMode
                ? 'bg-[#1a0f0a] border-[#2a1f1a]'
                : 'bg-white border-gray-200'
            } border rounded-2xl shadow-sm overflow-hidden`}
          >
            <div className={`p-6 ${isDarkMode ? 'border-b border-[#2a1f1a]' : 'border-b border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Clock className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatDate(order.created_at)}
                  </span>
                </div>
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Token: {order.token}
                </span>
              </div>

              {order.items && order.items.length > 0 && (
                <div className={`mt-4 ${isDarkMode ? 'border-t border-[#2a1f1a]' : 'border-t border-gray-200'} pt-4`}>
                  <h3 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Itens do Pedido
                  </h3>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {item.quantity}x {item.product_name}
                        </span>
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          R$ {item.subtotal.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Status: {order.status === 'pending' ? 'Pendente' : 
                            order.status === 'paid' ? 'Pago' :
                            order.status === 'completed' ? 'Concluído' : 
                            order.status === 'cancelled' ? 'Cancelado' : order.status}
                  </p>
                  <p className={`text-lg font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Total: R$ {order.total.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => handleReorder(order)}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Pedir Novamente</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 