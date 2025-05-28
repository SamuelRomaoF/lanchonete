import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import { ShoppingCart, Sun, Moon, Utensils, User } from 'lucide-react';
import CartDrawer from '../ui/CartDrawer';
import { useSupabase } from '../../contexts/SupabaseContext';

export default function Navbar() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { totalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useSupabase();

  // Debug: Verificar os dados do usuário
  useEffect(() => {
    console.log('Dados do usuário:', user);
    console.log('ID do usuário:', user?.id);
    console.log('Email do usuário:', user?.email);
    console.log('App metadata:', user?.app_metadata);
    console.log('É admin?', user?.app_metadata?.role === 'admin');
  }, [user]);

  const isAdmin = user?.app_metadata?.role === 'admin';
  const isLoggedIn = !!user;

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-colors duration-300 shadow-md ${
        isDarkMode ? 'bg-[#2C1A10] text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Utensils className="w-6 h-6 text-orange-500" />
                <span className="text-xl font-bold text-orange-500">Cantinho do Sabor</span>
              </Link>
            </div>

            <div className="hidden md:flex space-x-8 items-center">
              <Link to="/" className="hover:text-orange-500 transition-colors">
                Início
              </Link>
              <Link to="/cardapio" className="hover:text-orange-500 transition-colors">
                Cardápio
              </Link>
              <Link to="/pedidos" className="hover:text-orange-500 transition-colors">
                Meus Pedidos
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-colors ${
                  isDarkMode ? 'hover:bg-[#46342e]' : 'hover:bg-gray-200'
                }`}
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              <button 
                onClick={() => setIsCartOpen(true)} 
                className="relative p-2"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>

              {isLoggedIn && isAdmin && (
                <Link 
                  to="/admin" 
                  className={`p-2 rounded-full transition-colors ${
                    isDarkMode ? 'hover:bg-[#46342e]' : 'hover:bg-gray-200'
                  }`}
                  title="Área Administrativa"
                >
                  <User className="w-5 h-5 text-orange-500" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}