import { supabase } from '../config/supabase';

export async function generateDailyToken(): Promise<string> {
  const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      // Tentar fazer upsert do contador
      const { data, error } = await supabase
        .rpc('generate_daily_token', { target_date: today });

      if (error) {
        console.error('Erro ao gerar token:', error);
        attempts++;
        if (attempts === maxAttempts) {
          throw new Error('Erro ao gerar token do pedido');
        }
        // Esperar um pouco antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 100));
        continue;
      }

      // Validar a resposta
      if (!data || !Array.isArray(data) || data.length === 0 || !data[0] || typeof data[0].last_number !== 'number' || data[0].last_number < 1) {
        console.error('Resposta inválida do servidor:', data);
        throw new Error('Erro ao gerar token do pedido: resposta inválida do servidor');
      }

      return formatToken(data[0].last_number);
    } catch (error) {
      console.error('Erro ao gerar token:', error);
      attempts++;
      if (attempts === maxAttempts) {
        throw error;
      }
      // Esperar um pouco antes de tentar novamente com backoff exponencial
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 100));
    }
  }

  throw new Error('Erro ao gerar token do pedido: número máximo de tentativas excedido');
}

function formatToken(number: number): string {
  // Formata o número com zeros à esquerda (ex: 001, 002, etc)
  const formattedNumber = number.toString().padStart(3, '0');
  return `A${formattedNumber}`;
} 