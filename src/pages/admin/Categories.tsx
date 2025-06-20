import { Pencil, PlusIcon, Trash2, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useTheme } from '../../contexts/ThemeContext';

interface Category {
  id: number;
  name: string;
  description: string;
  created_at: string;
  slug: string;
}

// Função auxiliar para gerar slug
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

export default function Categories() {
  const { supabase } = useSupabase();
  const { isDarkMode } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para o modal de confirmação de exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [categoryNameToDelete, setCategoryNameToDelete] = useState<string>('');
  
  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  // Classes condicionais baseadas no tema
  const cardBg = isDarkMode ? 'bg-[#2C1A10]' : 'bg-white';
  const cardBorder = isDarkMode ? 'border-[#3C2A1F]' : 'border-gray-200';
  const inputBg = isDarkMode ? 'bg-[#3C2A1F]' : 'bg-gray-50';
  const inputBorder = isDarkMode ? 'border-[#3C2A1F]' : 'border-gray-300';
  const hoverBg = isDarkMode ? 'hover:bg-[#3C2A1F]' : 'hover:bg-gray-100';
  const tableBorderColor = isDarkMode ? 'border-[#3C2A1F]' : 'border-gray-200';
  const textColor = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const mutedTextColor = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const headerColor = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const modalBg = isDarkMode ? 'bg-[#2C1A10]' : 'bg-white';
  
  useEffect(() => {
    fetchCategories();
  }, []);
  
  async function fetchCategories() {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
        
      if (error) {
        throw error;
      }
      
      setCategories(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar categorias:', error);
      setError('Falha ao carregar categorias. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }
  
  function handleEdit(category: Category) {
    setCurrentCategory(category);
    setName(category.name);
    setDescription(category.description);
    setIsEditing(true);
  }
  
  function handleCancel() {
    setCurrentCategory(null);
    setName('');
    setDescription('');
    setIsEditing(false);
  }
  
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!name.trim()) {
        throw new Error('Nome é obrigatório');
      }

      const slug = generateSlug(name);
      const categoryData: {
        name: string;
        slug: string;
        description?: string;
      } = {
        name: name.trim(),
        slug
      };

      // Só adiciona description se não estiver vazio
      if (description.trim()) {
        categoryData.description = description.trim();
      }
      
      if (currentCategory) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', currentCategory.id);
          
        if (error) throw error;
      } else {
        // Create new category
        const { error } = await supabase
          .from('categories')
          .insert([categoryData]);
          
        if (error) throw error;
      }
      
      // Reset form and refetch categories
      handleCancel();
      await fetchCategories();
      
    } catch (error: any) {
      console.error('Erro ao salvar categoria:', error);
      setError('Falha ao salvar categoria. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }
  
  // Função para abrir o modal de confirmação de exclusão
  function confirmDelete(id: number, categoryName: string) {
    setCategoryToDelete(id);
    setCategoryNameToDelete(categoryName);
    setDeleteModalOpen(true);
  }
  
  // Função para cancelar a exclusão
  function cancelDelete() {
    setDeleteModalOpen(false);
    setCategoryToDelete(null);
    setCategoryNameToDelete('');
  }
  
  // Função para realizar a exclusão após confirmação
  async function handleDelete() {
    if (!categoryToDelete) return;
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryToDelete);
        
      if (error) throw error;
      
      await fetchCategories();
      
      // Fechar o modal após excluir
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      setCategoryNameToDelete('');
    } catch (error: any) {
      console.error('Erro ao excluir categoria:', error);
      setError('Falha ao excluir categoria. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className={`text-2xl font-bold ${headerColor}`}>Gerenciar Categorias</h1>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-[#e67e22] hover:bg-[#d35400] text-white px-3 py-1.5 rounded transition-colors"
          >
            <PlusIcon size={16} />
            Nova Categoria
          </button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-900 text-red-200 p-3 rounded">
          {error}
        </div>
      )}
      
      {/* Form */}
      {isEditing && (
        <div className={`${cardBg} p-4 rounded-lg border ${cardBorder}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-lg font-semibold ${headerColor}`}>
              {currentCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </h2>
            <button 
              onClick={handleCancel}
              className={`p-1 ${hoverBg} rounded-full transition-colors`}
            >
              <XIcon size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="name" className={`block mb-1 text-sm ${textColor}`}>Nome</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full p-2 ${inputBg} border ${inputBorder} rounded focus:outline-none focus:border-[#e67e22]`}
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className={`block mb-1 text-sm ${textColor}`}>Descrição</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full p-2 ${inputBg} border ${inputBorder} rounded focus:outline-none focus:border-[#e67e22]`}
                rows={3}
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className={`px-4 py-2 mr-2 ${inputBg} ${hoverBg} rounded transition-colors`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#e67e22] hover:bg-[#d35400] text-white rounded transition-colors"
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Categories List */}
      <div className={`${cardBg} rounded-lg border ${cardBorder} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${tableBorderColor}`}>
                <th className={`py-3 px-4 text-left ${headerColor}`}>Nome</th>
                <th className={`py-3 px-4 text-left ${headerColor}`}>Descrição</th>
                <th className={`py-3 px-4 text-right ${headerColor}`}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading && !categories.length ? (
                <tr>
                  <td colSpan={3} className={`py-8 text-center ${mutedTextColor}`}>
                    Carregando categorias...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className={`py-8 text-center ${mutedTextColor}`}>
                    Nenhuma categoria encontrada
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className={`border-b ${tableBorderColor}`}>
                    <td className={`py-3 px-4 ${textColor}`}>{category.name}</td>
                    <td className={`py-3 px-4 ${textColor}`}>{category.description}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className={`p-1 ${hoverBg} rounded transition-colors`}
                        >
                          <Pencil size={16} className={textColor} />
                        </button>
                        <button
                          onClick={() => confirmDelete(category.id, category.name)}
                          className={`p-1 ${hoverBg} rounded transition-colors text-red-500`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal de Confirmação de Exclusão */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={cancelDelete}></div>
          <div className={`${modalBg} p-6 rounded-lg shadow-lg max-w-md w-full z-10`}>
            <h3 className={`text-lg font-semibold mb-4 ${headerColor}`}>Deseja apagar essa categoria?</h3>
            <p className={`mb-6 ${textColor}`}>
              Você está prestes a excluir a categoria "{categoryNameToDelete}". Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className={`px-4 py-2 ${inputBg} ${hoverBg} rounded transition-colors`}
              >
                Não
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                Sim, apagar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 