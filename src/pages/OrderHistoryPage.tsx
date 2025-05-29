import { RefreshCw, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { orderService } from '../services/orderService';
import { Order } from '../types/order';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isDarkMode } = useTheme();
  const { user } = useAuth();

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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Histórico de Pedidos
          </h1>
          <div className="flex gap-2">
            <button
              onClick={fetchOrders}
              className="inline-flex items-center justify-center px-3 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
            >
              Limpar Histórico
            </button>
            <button
              onClick={fetchOrders}
              className="inline-flex items-center justify-center px-3 py-1.5 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>

        {/* Container com scroll horizontal */}
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Cabeçalho da tabela */}
            <div className={`grid grid-cols-4 gap-4 py-2 px-3 text-sm font-medium border-b ${
              isDarkMode ? 'text-gray-300 border-[#2a1f1a]' : 'text-gray-600 border-gray-200'
            }`}>
              <div>Pedido</div>
              <div>Cliente</div>
              <div>Data</div>
              <div className="text-right">$</div>
            </div>

            {/* Lista de pedidos */}
            <div className="space-y-1 mt-1">
              {orders.map((order) => {
                const totalValue = order.items?.reduce((acc, item) => acc + item.subtotal, 0) || 0;
                
                return (
                  <div
                    key={order.id}
                    className={`grid grid-cols-4 gap-4 py-2 px-3 text-sm ${
                      isDarkMode
                        ? 'bg-[#1a0f0a] text-gray-300 hover:bg-[#2a1f1a]'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    <div className="truncate">{order.token}</div>
                    <div className="truncate">adm</div>
                    <div className="truncate">{formatDate(order.created_at)}</div>
                    <div className="text-right">R$ {totalValue.toFixed(2)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 