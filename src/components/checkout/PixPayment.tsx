import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/orderService';
import QRCode from 'qrcode';

interface PixPaymentProps {
  amount: number;
  customerName: string;
  onPaymentComplete: (token: string) => void;
}

export const PixPayment: React.FC<PixPaymentProps> = ({
  amount,
  customerName,
  onPaymentComplete,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [orderToken, setOrderToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isDarkMode } = useTheme();
  const { cartItems, clearCart } = useCart();
  const { setUser } = useAuth();

  useEffect(() => {
    const generatePixQRCode = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Criar o pedido no banco de dados
        const order = await orderService.createOrder(customerName, cartItems);
        if (!order.token) {
          throw new Error('Token do pedido não foi gerado');
        }
        
        setOrderToken(order.token);
        console.log('Token gerado:', order.token); // Debug

        // Salvar o nome do cliente no AuthContext
        setUser({ name: customerName });

        // Gerar o payload do PIX (em produção, isso viria da API do banco)
        const pixPayload = {
          pixKey: 'SEU_PIX_AQUI', // Chave PIX da loja
          description: `Pedido ${order.token}`,
          merchantName: 'Cantinho do Sabor',
          amount: amount.toFixed(2),
          txid: order.token
        };

        // Gerar o QR code (em produção, o payload viria da API do banco)
        const qrCode = await QRCode.toDataURL(JSON.stringify(pixPayload));
        setQrCodeUrl(qrCode);
      } catch (err) {
        setError('Erro ao gerar QR Code. Por favor, tente novamente.');
        console.error('Erro:', err);
      } finally {
        setIsLoading(false);
      }
    };

    generatePixQRCode();
  }, [amount, customerName, cartItems, setUser]);

  const handleManualConfirmation = async () => {
    try {
      if (!orderToken) {
        console.error('Token não encontrado:', orderToken); // Debug
        setError('Token do pedido não encontrado. Por favor, tente novamente.');
        return;
      }

      console.log('Confirmando pedido com token:', orderToken); // Debug

      const order = await orderService.getOrderByToken(orderToken);
      console.log('Pedido encontrado:', order); // Debug

      if (order?.id) {
        await orderService.updateOrderStatus(order.id.toString(), 'paid');
        clearCart();
        console.log('Chamando onPaymentComplete com token:', orderToken); // Debug
        onPaymentComplete(orderToken);
      } else {
        throw new Error('Pedido não encontrado');
      }
    } catch (err) {
      console.error('Erro completo na confirmação:', err);
      setError('Erro ao confirmar pagamento. Por favor, tente novamente.');
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto p-6 rounded-lg shadow-lg ${
      isDarkMode ? 'bg-[#2C1A10] text-white' : 'bg-white text-gray-800'
    }`}>
      <h2 className="text-2xl font-bold mb-4">Pagamento via PIX</h2>
      
      <div className="text-center space-y-4">
        <p className="mb-4">
          Valor a pagar: <span className="font-bold">R$ {amount.toFixed(2)}</span>
        </p>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : error ? (
          <div className={`text-red-500 p-4 rounded-lg ${
            isDarkMode ? 'bg-red-900/20' : 'bg-red-100'
          }`}>
            {error}
            <button
              onClick={() => window.location.reload()}
              className="mt-4 w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        ) : (
          <>
            {qrCodeUrl && (
              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-[#3C2A1F]' : 'bg-gray-100'
              }`}>
                <img
                  src={qrCodeUrl}
                  alt="QR Code PIX"
                  className="mx-auto w-48 h-48"
                />
              </div>
            )}

            <div className="mt-6">
              <p className="text-sm mb-4">
                Escaneie o QR Code acima com o aplicativo do seu banco para realizar o pagamento.
                O pedido será confirmado automaticamente após o pagamento.
              </p>

              {/* Botão temporário para simular pagamento - remover em produção */}
              <button
                onClick={handleManualConfirmation}
                className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Simular Confirmação do Pagamento
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}; 