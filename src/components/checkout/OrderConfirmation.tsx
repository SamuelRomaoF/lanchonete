import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { CartItem } from '../../types/order';

interface OrderConfirmationProps {
  cartTotal: number;
  cartItems: CartItem[];
  onContinue: (customerName: string) => void;
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  cartTotal,
  cartItems,
  onContinue,
}) => {
  const [customerName, setCustomerName] = useState('');
  const { isDarkMode } = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerName.trim()) {
      onContinue(customerName);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto p-6 rounded-lg shadow-lg ${
      isDarkMode ? 'bg-[#2C1A10] text-white' : 'bg-white text-gray-800'
    }`}>
      <h2 className="text-2xl font-bold mb-4">Confirmar Pedido</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block mb-2">
            Seu Nome
          </label>
          <input
            type="text"
            id="name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className={`w-full p-2 rounded border ${
              isDarkMode 
                ? 'bg-[#3C2A1F] border-[#5a443c] text-white' 
                : 'bg-white border-gray-300 text-gray-800'
            }`}
            required
          />
        </div>

        <div className="mt-4">
          <h3 className="font-semibold mb-2">Itens do Pedido:</h3>
          <div className={`rounded-lg p-4 ${
            isDarkMode ? 'bg-[#3C2A1F]' : 'bg-gray-100'
          }`}>
            {cartItems.map((item, index) => (
              <div key={index} className="flex justify-between mb-2">
                <span>{item.quantity}x {item.product.name}</span>
                <span>R$ {(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t mt-2 pt-2 font-bold">
              <span>Total:</span>
              <span className="float-right">R$ {cartTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 mt-6 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          Continuar para Pagamento PIX
        </button>
      </form>
    </div>
  );
}; 