import { Menu, Moon, ShoppingCart, Sun, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useTheme } from '../../contexts/ThemeContext';
import CartDrawer from '../ui/CartDrawer';

export default function Navbar() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { totalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useSupabase();

  const isAdmin = user?.app_metadata?.role === 'admin';

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-colors duration-300 shadow-md ${
        isDarkMode ? 'bg-[#2C1A10] text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-xl font-bold text-orange-500">Cantinho do Sabor</span>
              </Link>
            </div>

            {/* Links de navegação para desktop */}
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
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="hover:text-orange-500 transition-colors"
                  title="Área Administrativa"
                >
                  Administração
                </Link>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* Botão de tema */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-[#3C2A1F]' : 'hover:bg-gray-100'}`}
                aria-label={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
              >
                {isDarkMode ? (
                  <Sun className="h-6 w-6" />
                ) : (
                  <Moon className="h-6 w-6" />
                )}
              </button>

              {/* Botão do carrinho */}
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

              {/* Botão do menu mobile */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#3C2A1F]"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Menu mobile */}
          {isMobileMenuOpen && (
            <div className={`md:hidden py-4 ${isDarkMode ? 'bg-[#2C1A10]' : 'bg-white'}`}>
              <div className="flex flex-col space-y-4 px-4">
                <Link 
                  to="/" 
                  className="hover:text-orange-500 transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Início
                </Link>
                <Link 
                  to="/cardapio" 
                  className="hover:text-orange-500 transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Cardápio
                </Link>
                <Link 
                  to="/pedidos" 
                  className="hover:text-orange-500 transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Meus Pedidos
                </Link>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="hover:text-orange-500 transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Administração
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}