import { useState, useEffect } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { ShoppingCart, Star, AlertCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function FeaturedProducts() {
  const { supabase } = useSupabase();
  const { isDarkMode } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  // Classes condicionais baseadas no tema
  const cardBg = isDarkMode ? 'bg-[#2a211c]' : 'bg-white';
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const mutedTextColor = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const headerColor = isDarkMode ? 'text-white' : 'text-gray-900';

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_featured', true)
          .order('name');

        if (error) throw error;
        setProducts(data || []);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar produtos em destaque:', err);
        setError('Falha ao carregar os produtos em destaque. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedProducts();
  }, [supabase]);

  if (loading) {
    return (
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className={`text-3xl font-bold text-center mb-2 ${headerColor}`}>Mais Populares</h2>
          <p className={`text-center ${mutedTextColor} mb-8`}>Os favoritos dos nossos clientes</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`${cardBg} rounded-lg shadow-lg overflow-hidden animate-pulse`}>
                <div className="h-48 bg-gray-300 dark:bg-gray-700"></div>
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className={`text-3xl font-bold text-center mb-2 ${headerColor}`}>Mais Populares</h2>
          <p className={`text-center ${mutedTextColor} mb-8`}>Os favoritos dos nossos clientes</p>
          <div className="flex items-center justify-center p-6 border border-red-300 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className={`text-3xl font-bold text-center mb-2 ${headerColor}`}>Mais Populares</h2>
        <p className={`text-center ${mutedTextColor} mb-8`}>Os favoritos dos nossos clientes</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div 
              key={product.id} 
              className={`${cardBg} rounded-lg shadow-lg overflow-hidden transform transition-transform hover:scale-105`}
            >
              {product.image_url ? (
                <div className="relative h-48">
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-yellow-400 text-yellow-900">
                      <Star className="w-4 h-4 mr-1" />
                      Destaque
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <ShoppingCart className="w-12 h-12 text-gray-400" />
                </div>
              )}
              
              <div className="p-4">
                <h3 className={`text-xl font-semibold mb-2 ${textColor}`}>{product.name}</h3>
                {product.description && (
                  <p className={`${mutedTextColor} mb-4 line-clamp-2`}>
                    {product.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    {product.is_on_sale && product.old_price && (
                      <span className={`text-sm line-through ${mutedTextColor}`}>
                        R$ {product.old_price.toFixed(2)}
                      </span>
                    )}
                    <span className={`text-lg font-bold ${product.is_on_sale ? 'text-green-500' : textColor}`}>
                      R$ {product.price.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    className="flex items-center px-4 py-2 bg-[#e67e22] hover:bg-[#d35400] text-white rounded-full transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 