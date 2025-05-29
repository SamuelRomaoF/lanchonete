import { ImageIcon, Pencil, PlusIcon, Star, Trash2, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useTheme } from '../../contexts/ThemeContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  created_at: string;
  is_featured: boolean;
  in_stock: boolean;
  is_on_sale: boolean;
  old_price?: number;
}

interface Category {
  id: string;
  name: string;
}

export default function Products() {
  const { supabase } = useSupabase();
  const { isDarkMode } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para o modal de confirmação de exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [productNameToDelete, setProductNameToDelete] = useState<string>('');
  
  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [inStock, setInStock] = useState(true);
  const [isOnSale, setIsOnSale] = useState(false);
  const [oldPrice, setOldPrice] = useState('');
  
  // Classes condicionais baseadas no tema
  const cardBg = isDarkMode ? 'bg-[#2C1A10]' : 'bg-white';
  const cardBorder = isDarkMode ? 'border-[#3C2A1F]' : 'border-gray-200';
  const inputBg = isDarkMode ? 'bg-[#3C2A1F]' : 'bg-gray-50';
  const inputBorder = isDarkMode ? 'border-[#3C2A1F]' : 'border-gray-300';
  const hoverBg = isDarkMode ? 'hover:bg-[#3C2A1F]' : 'hover:bg-gray-100';
  const textColor = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const mutedTextColor = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const headerColor = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const modalBg = isDarkMode ? 'bg-[#2C1A10]' : 'bg-white';
  const modalOverlayBg = 'bg-black bg-opacity-50';
  
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);
  
  async function fetchProducts() {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
        
      if (error) throw error;
      setProducts(data || []);
    } catch (error: unknown) {
      console.error('Erro ao buscar produtos:', error);
      setError('Falha ao carregar produtos. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }
  
  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
        
      if (error) throw error;
      setCategories(data || []);
    } catch (error: unknown) {
      console.error('Erro ao buscar categorias:', error);
    }
  }
  
  function handleEdit(product: Product) {
    if (!product) return;
    
    setCurrentProduct(product);
    setName(product.name || '');
    setDescription(product.description || '');
    setPrice(product.price ? String(product.price) : '0');
    setCategoryId(product.category_id || '');
    setImageUrl(product.image_url || '');
    setImagePreview(product.image_url || '');
    setIsFeatured(product.is_featured || false);
    setInStock(product.in_stock !== false);
    setIsOnSale(product.is_on_sale || false);
    setOldPrice(product.old_price ? String(product.old_price) : '');
    setIsEditing(true);
  }
  
  function handleCancel() {
    setCurrentProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategoryId('');
    setImage(null);
    setImageUrl('');
    setImagePreview('');
    setIsFeatured(false);
    setInStock(true);
    setIsOnSale(false);
    setOldPrice('');
    setIsEditing(false);
  }
  
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }
  
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Validar dados obrigatórios
      if (!name.trim()) throw new Error('Nome é obrigatório');
      if (!categoryId) throw new Error('Categoria é obrigatória');
      
      const priceValue = parseFloat(price);
      if (isNaN(priceValue) || priceValue < 0) {
        throw new Error('Preço inválido');
      }

      // Upload image first if exists
      let newImageUrl = imageUrl;
      if (image) {
        try {
          if (image.size > 2 * 1024 * 1024) {
            throw new Error('A imagem deve ter no máximo 2MB');
          }

          if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(image.type)) {
            throw new Error('Formato de imagem não suportado. Use JPG, PNG, GIF ou WEBP');
          }

          const fileExt = image.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
          const filePath = `products/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, image, {
              cacheControl: '3600',
              upsert: true
            });
            
          if (uploadError) throw uploadError;
          
          const { data: urlData } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);
            
          if (!urlData?.publicUrl) {
            throw new Error('Erro ao obter URL da imagem');
          }
            
          newImageUrl = urlData.publicUrl;
        } catch (uploadError: unknown) {
          console.error('Erro ao fazer upload da imagem:', uploadError);
          const errorMessage = uploadError instanceof Error ? uploadError.message : 'Erro desconhecido';
          throw new Error(`Erro ao fazer upload da imagem: ${errorMessage}`);
        }
      }
      
      const productData = {
        name: name.trim(),
        description: description.trim() || null,
        price: priceValue,
        category_id: categoryId,
        image_url: newImageUrl || null,
        is_featured: isFeatured,
        in_stock: inStock,
        is_on_sale: isOnSale,
        old_price: isOnSale ? parseFloat(oldPrice) || null : null
      };
      
      if (currentProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', currentProduct.id);
          
        if (error) throw error;
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert([productData]);
          
        if (error) throw error;
      }
      
      // Reset form and refetch products
      handleCancel();
      await fetchProducts();
      
    } catch (error: unknown) {
      console.error('Erro ao salvar produto:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(`Falha ao salvar produto: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }
  
  function confirmDelete(id: string, productName: string) {
    setProductToDelete(id);
    setProductNameToDelete(productName);
    setDeleteModalOpen(true);
  }
  
  function cancelDelete() {
    setDeleteModalOpen(false);
    setProductToDelete(null);
    setProductNameToDelete('');
  }
  
  async function handleDelete() {
    if (!productToDelete) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete);
        
      if (error) throw error;
      
      setProducts(products.filter(product => product.id !== productToDelete));
      setDeleteModalOpen(false);
      setProductToDelete(null);
      setProductNameToDelete('');
    } catch (error: unknown) {
      console.error('Erro ao excluir produto:', error);
      setError('Falha ao excluir produto. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className={`text-2xl sm:text-3xl font-bold mb-4 sm:mb-0 ${headerColor}`}>
          Gerenciar Produtos
        </h1>
        <button 
          onClick={() => setIsEditing(true)}
          className={`w-full sm:w-auto px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center`}
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Novo Produto
        </button>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div 
              key={product.id} 
              className={`${cardBg} ${cardBorder} rounded-lg shadow-sm overflow-hidden`}
            >
              <div className="p-4">
                <div className="flex items-center space-x-4 mb-4">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-medium truncate ${textColor}`}>
                      {product.name}
                    </h3>
                    <p className={`text-sm ${mutedTextColor}`}>
                      {categories.find(c => c.id === product.category_id)?.name}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.is_featured && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Star className="w-3 h-3 mr-1" />
                      Destaque
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    product.in_stock 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.in_stock ? 'Em estoque' : 'Fora de estoque'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className={`font-medium ${textColor}`}>
                      R$ {product.price.toFixed(2)}
                    </span>
                    {product.is_on_sale && product.old_price && (
                      <span className="text-sm line-through text-gray-500">
                        R$ {product.old_price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className={`p-2 rounded-lg ${hoverBg} text-blue-600 hover:text-blue-800`}
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => confirmDelete(product.id, product.name)}
                      className={`p-2 rounded-lg ${hoverBg} text-red-600 hover:text-red-800`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de edição/criação */}
      {isEditing && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className={modalOverlayBg}></div>
            </div>

            <div className={`inline-block align-bottom ${modalBg} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
              <form onSubmit={handleSave} className="px-4 pt-5 pb-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-lg font-medium ${headerColor}`}>
                    {currentProduct ? 'Editar Produto' : 'Novo Produto'}
                  </h3>
                  <button 
                    type="button"
                    onClick={handleCancel}
                    className={`${mutedTextColor} hover:text-gray-500`}
                  >
                    <XIcon className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className={`block text-sm font-medium ${textColor}`}>
                      Nome
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`mt-1 block w-full rounded-md ${inputBg} ${inputBorder} shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-500 focus:ring-opacity-50 ${textColor}`}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className={`block text-sm font-medium ${textColor}`}>
                      Descrição
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className={`mt-1 block w-full rounded-md ${inputBg} ${inputBorder} shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-500 focus:ring-opacity-50 ${textColor}`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="price" className={`block text-sm font-medium ${textColor}`}>
                        Preço
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className={`text-gray-500 sm:text-sm`}>R$</span>
                        </div>
                        <input
                          type="number"
                          id="price"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          step="0.01"
                          min="0"
                          className={`block w-full pl-10 pr-3 py-2 rounded-md ${inputBg} ${inputBorder} shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-500 focus:ring-opacity-50 ${textColor}`}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="category" className={`block text-sm font-medium ${textColor}`}>
                        Categoria
                      </label>
                      <select
                        id="category"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className={`mt-1 block w-full rounded-md ${inputBg} ${inputBorder} shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-500 focus:ring-opacity-50 ${textColor}`}
                        required
                      >
                        <option value="">Selecione...</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textColor} mb-2`}>
                      Imagem
                    </label>
                    <div className="flex items-center space-x-4">
                      {(imagePreview || imageUrl) && (
                        <img
                          src={imagePreview || imageUrl}
                          alt="Preview"
                          className="h-20 w-20 rounded-lg object-cover"
                        />
                      )}
                      <label className={`cursor-pointer ${textColor} hover:text-orange-500`}>
                        <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium bg-white hover:bg-gray-50">
                          <ImageIcon className="w-5 h-5 mr-2" />
                          Escolher Imagem
                        </span>
                        <input
                          type="file"
                          onChange={handleImageChange}
                          accept="image/*"
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className={`flex items-center space-x-2 ${textColor}`}>
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="rounded text-orange-500 focus:ring-orange-500"
                      />
                      <span>Produto em Destaque</span>
                    </label>

                    <label className={`flex items-center space-x-2 ${textColor}`}>
                      <input
                        type="checkbox"
                        checked={inStock}
                        onChange={(e) => setInStock(e.target.checked)}
                        className="rounded text-orange-500 focus:ring-orange-500"
                      />
                      <span>Em Estoque</span>
                    </label>

                    <label className={`flex items-center space-x-2 ${textColor}`}>
                      <input
                        type="checkbox"
                        checked={isOnSale}
                        onChange={(e) => setIsOnSale(e.target.checked)}
                        className="rounded text-orange-500 focus:ring-orange-500"
                      />
                      <span>Em Promoção</span>
                    </label>

                    {isOnSale && (
                      <div className="mt-2">
                        <label htmlFor="oldPrice" className={`block text-sm font-medium ${textColor}`}>
                          Preço Original
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className={`text-gray-500 sm:text-sm`}>R$</span>
                          </div>
                          <input
                            type="number"
                            id="oldPrice"
                            value={oldPrice}
                            onChange={(e) => setOldPrice(e.target.value)}
                            step="0.01"
                            min="0"
                            className={`block w-full pl-10 pr-3 py-2 rounded-md ${inputBg} ${inputBorder} shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-500 focus:ring-opacity-50 ${textColor}`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className={`px-4 py-2 border ${cardBorder} rounded-md shadow-sm text-sm font-medium ${textColor} ${hoverBg}`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded-md shadow-sm text-sm font-medium hover:bg-orange-600"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className={modalOverlayBg}></div>
            </div>

            <div className={`inline-block align-bottom ${modalBg} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className={`text-lg font-medium ${headerColor}`}>
                      Excluir Produto
                    </h3>
                    <div className="mt-2">
                      <p className={mutedTextColor}>
                        Tem certeza que deseja excluir o produto "{productNameToDelete}"? Esta ação não pode ser desfeita.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse`}>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Excluir
                </button>
                <button
                  type="button"
                  onClick={cancelDelete}
                  className={`mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border ${cardBorder} shadow-sm px-4 py-2 ${cardBg} text-base font-medium ${textColor} hover:${hoverBg} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm`}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}