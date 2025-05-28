import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Variáveis de ambiente do Supabase não configuradas!');
}

// Cliente público (para operações do cliente web)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ID do restaurante (deve ser configurado no .env)
export const RESTAURANT_ID = import.meta.env.VITE_RESTAURANT_ID;

if (!RESTAURANT_ID) {
  console.error('⚠️ ID do restaurante não configurado!');
} 