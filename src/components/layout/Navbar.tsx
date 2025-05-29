import { Moon, ShoppingCart, Sun, User, Utensils } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useTheme } from '../../contexts/ThemeContext';
import CartDrawer from '../ui/CartDrawer';

export default function Navbar() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { totalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useSupabase();
  const navigate = useNavigate();

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

  const handleLoginClick = () => {
    navigate('/login');
  };

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
                onClick={handleLoginClick}
                className={`p-2 rounded-full ${
                  isDarkMode ? 'hover:bg-[#3C2A1F]' : 'hover:bg-gray-100'
                }`}
                aria-label="Login"
              >
                <User className="h-6 w-6" />
              </button>

              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full ${
                  isDarkMode ? 'hover:bg-[#3C2A1F]' : 'hover:bg-gray-100'
                }`}
                aria-label={isDarkMode ? 'Modo claro' : 'Modo escuro'}
              >
                {isDarkMode ? (
                  <Sun className="h-6 w-6" />
                ) : (
                  <Moon className="h-6 w-6" />
                )}
              </button>

              <button 
                onClick={() => setIsCartOpen(true)} 
                className={`p-2 rounded-full ${
                  isDarkMode ? 'hover:bg-[#3C2A1F]' : 'hover:bg-gray-100'
                } relative`}
              >
                <ShoppingCart className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
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