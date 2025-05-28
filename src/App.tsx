import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { CartProvider } from './contexts/CartContext';
import { SupabaseProvider } from './contexts/SupabaseContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import AdminLayout from './components/admin/Layout';
import Dashboard from './pages/admin/Dashboard';
import Categories from './pages/admin/Categories';
import Products from './pages/admin/Products';
import Orders from './pages/admin/Orders';
import OrderHistoryPage from './pages/OrderHistoryPage';
import { PrivateRoute } from './components/auth/PrivateRoute';

function App() {
  return (
    <SupabaseProvider>
      <ThemeProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col">
            <Routes>
              {/* Rotas do Cliente */}
              <Route path="/" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <HomePage />
                  </main>
                  <Footer />
                </>
              } />
              <Route path="/cardapio" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <MenuPage />
                  </main>
                  <Footer />
                </>
              } />
              <Route path="/carrinho" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <CartPage />
                  </main>
                  <Footer />
                </>
              } />
              <Route path="/pedidos" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <OrderHistoryPage />
                  </main>
                  <Footer />
                </>
              } />
              <Route path="/login" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <LoginPage />
                  </main>
                  <Footer />
                </>
              } />
              
              {/* Rotas Admin */}
              <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="categorias" element={<Categories />} />
                <Route path="produtos" element={<Products />} />
                <Route path="pedidos" element={<Orders />} />
              </Route>
            </Routes>
          </div>
        </CartProvider>
      </ThemeProvider>
    </SupabaseProvider>
  );
}

export default App;