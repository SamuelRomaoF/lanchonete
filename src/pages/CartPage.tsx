import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { CheckoutFlow } from '../components/checkout/CheckoutFlow';
import { useTheme } from '../contexts/ThemeContext';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, totalPrice } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { isDarkMode } = useTheme();

  if (cartItems.length === 0) {
    return (
      <div className="section-container">
        <h1 className={`text-3xl font-bold text-center mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Seu Carrinho
        </h1>
        <div className="flex flex-col items-center justify-center py-16">
          <ShoppingCart className={`w-16 h-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} mb-4`} />
          <h2 className={`text-xl font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Seu carrinho está vazio
          </h2>
          <p className={`text-center max-w-md mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Adicione alguns itens deliciosos do nosso cardápio para começar seu pedido.
          </p>
          <Link to="/cardapio" className="btn-primary">
            Ver Cardápio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section-container">
      <h1 className={`text-3xl font-bold text-center mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Seu Carrinho
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className={`rounded-lg overflow-hidden shadow-md ${
            isDarkMode ? 'bg-[#2C1A10]' : 'bg-white'
          }`}>
            <div className={`divide-y ${
              isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
            }`}>
              {cartItems.map((item) => (
                <div key={item.product.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center">
                  {item.product.image_url && (
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded-md mr-4 mb-4 sm:mb-0"
                    />
                  )}
                  
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {item.product.name}
                    </h3>
                    <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {item.product.description}
                    </p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      R$ {item.product.price.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="flex items-center mt-4 sm:mt-0">
                      <button
                      onClick={() => updateQuantity(Number(item.product.id), item.quantity - 1)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isDarkMode 
                          ? 'bg-gray-700 hover:bg-gray-600' 
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                      >
                      <Minus className="w-4 h-4" />
                      </button>
                    <span className={`mx-3 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {item.quantity}
                    </span>
                      <button
                      onClick={() => updateQuantity(Number(item.product.id), item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    <button
                      onClick={() => removeFromCart(Number(item.product.id))}
                      className={`ml-4 ${
                        isDarkMode 
                          ? 'text-red-400 hover:text-red-300' 
                          : 'text-red-500 hover:text-red-700'
                      }`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className={`rounded-lg overflow-hidden shadow-md p-6 ${
            isDarkMode ? 'bg-[#2C1A10]' : 'bg-white'
          }`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Resumo do Pedido
            </h2>
            
            <div className="space-y-3 mb-6">
              {cartItems.map((item) => (
                <div key={item.product.id} className={`flex justify-between ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <span>{item.quantity}x {item.product.name}</span>
                  <span>R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className={`border-t pt-4 mb-6 ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className={`flex justify-between font-bold text-lg ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <span>Total</span>
                <span>R$ {totalPrice.toFixed(2)}</span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsCheckoutOpen(true)}
              className="btn-primary w-full py-3 mb-4"
            >
              Finalizar Pedido
            </button>
            
            <Link to="/cardapio" className="btn-outline w-full block text-center py-3">
              Continuar Comprando
            </Link>
          </div>
        </div>
      </div>

      {isCheckoutOpen && (
        <CheckoutFlow
          cartItems={cartItems}
          cartTotal={totalPrice}
          onClose={() => setIsCheckoutOpen(false)}
        />
      )}
    </div>
  );
}