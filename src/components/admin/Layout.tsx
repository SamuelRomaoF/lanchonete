import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useSupabase } from '../../contexts/SupabaseContext';
import { 
  LayoutDashboard, 
  Package as PackageIcon, 
  Tags as TagsIcon, 
  ClipboardList,
  Store as StoreIcon,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { supabase } = useSupabase();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a0f0a]' : 'bg-gray-100'}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-[#2C1A10] border-[#5a443c]' : 'bg-white border-gray-200'} border-b sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <PackageIcon className="text-orange-500" />
              <span className="ml-2 text-xl font-medium text-orange-500">Cantinho do Sabor</span>
            </div>

            <nav className="hidden md:flex space-x-4">
              <NavLink 
                to="/admin" 
                end
                className={({ isActive }) => 
                  `px-3 py-2 rounded-md text-sm font-medium ${
                    isActive 
                      ? 'bg-orange-500 text-white' 
                      : isDarkMode 
                        ? 'text-gray-300 hover:bg-[#3C2A1F]' 
                        : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink 
                to="/admin/categorias"
                className={({ isActive }) => 
                  `px-3 py-2 rounded-md text-sm font-medium ${
                    isActive 
                      ? 'bg-orange-500 text-white' 
                      : isDarkMode 
                        ? 'text-gray-300 hover:bg-[#3C2A1F]' 
                        : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                Categorias
              </NavLink>
              <NavLink 
                to="/admin/produtos"
                className={({ isActive }) => 
                  `px-3 py-2 rounded-md text-sm font-medium ${
                    isActive 
                      ? 'bg-orange-500 text-white' 
                      : isDarkMode 
                        ? 'text-gray-300 hover:bg-[#3C2A1F]' 
                        : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                Produtos
              </NavLink>
              <NavLink 
                to="/admin/pedidos"
                className={({ isActive }) => 
                  `px-3 py-2 rounded-md text-sm font-medium ${
                    isActive 
                      ? 'bg-orange-500 text-white' 
                      : isDarkMode 
                        ? 'text-gray-300 hover:bg-[#3C2A1F]' 
                        : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                Pedidos
              </NavLink>
              <Link 
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isDarkMode 
                    ? 'text-gray-300 hover:bg-[#3C2A1F]' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Loja
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleTheme}
                className={`p-2 rounded-full ${
                  isDarkMode 
                    ? 'hover:bg-[#3C2A1F] text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <button
                onClick={handleLogout}
                className={`p-2 rounded-full ${
                  isDarkMode 
                    ? 'hover:bg-[#3C2A1F] text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className={`md:hidden ${
        isDarkMode ? 'bg-[#2C1A10] border-[#5a443c]' : 'bg-white border-gray-200'
      } border-b flex justify-between p-2 sticky top-16 z-40`}>
        <NavLink 
          to="/admin" 
          end
          className={({ isActive }) => 
            `flex flex-col items-center p-2 rounded-md ${
              isActive 
                ? 'text-orange-500' 
                : isDarkMode 
                  ? 'text-gray-300' 
                  : 'text-gray-700'
            }`
          }
        >
          <LayoutDashboard size={20} />
          <span className="text-xs mt-1">Dashboard</span>
        </NavLink>

        <NavLink 
          to="/admin/categorias"
          className={({ isActive }) => 
            `flex flex-col items-center p-2 rounded-md ${
              isActive 
                ? 'text-orange-500' 
                : isDarkMode 
                  ? 'text-gray-300' 
                  : 'text-gray-700'
            }`
          }
        >
          <TagsIcon size={20} />
          <span className="text-xs mt-1">Categorias</span>
        </NavLink>

        <NavLink 
          to="/admin/produtos"
          className={({ isActive }) => 
            `flex flex-col items-center p-2 rounded-md ${
              isActive 
                ? 'text-orange-500' 
                : isDarkMode 
                  ? 'text-gray-300' 
                  : 'text-gray-700'
            }`
          }
        >
          <PackageIcon size={20} />
          <span className="text-xs mt-1">Produtos</span>
        </NavLink>

        <NavLink 
          to="/admin/pedidos"
          className={({ isActive }) => 
            `flex flex-col items-center p-2 rounded-md ${
              isActive 
                ? 'text-orange-500' 
                : isDarkMode 
                  ? 'text-gray-300' 
                  : 'text-gray-700'
            }`
          }
        >
          <ClipboardList size={20} />
          <span className="text-xs mt-1">Pedidos</span>
        </NavLink>

        <Link 
          to="/"
          className={`flex flex-col items-center p-2 rounded-md ${
            isDarkMode 
              ? 'text-gray-300' 
              : 'text-gray-700'
          }`}
        >
          <StoreIcon size={20} />
          <span className="text-xs mt-1">Loja</span>
        </Link>
      </nav>

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout; 