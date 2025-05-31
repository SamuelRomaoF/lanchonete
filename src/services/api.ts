import { supabase } from '../supabase/client';
import { Category, Product } from '../types';

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}

export async function getProducts(categorySlug?: string): Promise<Product[]> {
  let query = supabase.from('products').select(`
    *,
    categories (*)
  `)
  .is('deleted_at', null)
  .eq('in_stock', true);

  if (categorySlug && categorySlug !== 'todos') {
    query = query.eq('categories.slug', categorySlug);
  }

  const { data, error } = await query.order('name');

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data || [];
}

export async function getPopularProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .is('deleted_at', null)
    .eq('in_stock', true)
    .eq('is_popular', true)
    .order('name');

  if (error) {
    console.error('Error fetching popular products:', error);
    return [];
  }

  return data || [];
}

export async function getSpecialOffers(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_special_offer', true)
    .order('name');

  if (error) {
    console.error('Error fetching special offers:', error);
    return [];
  }

  return data || [];
}