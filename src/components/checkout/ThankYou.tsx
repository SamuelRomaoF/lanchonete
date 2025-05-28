import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ThankYouProps {
  customerName: string;
  token: string;
}

export const ThankYou: React.FC<ThankYouProps> = ({
  customerName,
  token,
}) => {
  const { isDarkMode } = useTheme();
  const { setUser } = useAuth();

  React.useEffect(() => {
    // Garantir que o nome do cliente está salvo no AuthContext
    setUser({ name: customerName });
  }, [customerName, setUser]);

  return (
    <div className={`w-full max-w-md mx-auto p-6 rounded-lg shadow-lg text-center ${
      isDarkMode ? 'bg-[#2C1A10] text-white' : 'bg-white text-gray-800'
    }`}>
      <div className="mb-8">
        <svg
          className="w-16 h-16 mx-auto text-green-500 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <h2 className="text-2xl font-bold mb-4">Pedido Confirmado!</h2>
        <p className="mb-6">
          Obrigado pela sua compra, {customerName}!
        </p>
      </div>

      <div className={`p-6 rounded-lg mb-6 ${
        isDarkMode ? 'bg-[#3C2A1F]' : 'bg-gray-100'
      }`}>
        <h3 className="font-bold mb-2">Seu Token de Retirada:</h3>
        <p className="text-3xl font-mono tracking-wider">{token}</p>
        <p className={`text-sm mt-4 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Apresente este token no balcão para retirar seu pedido
        </p>
      </div>

      <div className={`p-4 rounded-lg ${
        isDarkMode ? 'bg-[#3C2A1F]' : 'bg-gray-100'
      }`}>
        <h3 className="font-semibold mb-2">Instruções:</h3>
        <ol className={`text-sm text-left space-y-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          <li>1. Aguarde a preparação do seu pedido</li>
          <li>2. Dirija-se ao balcão de retirada</li>
          <li>3. Apresente o token acima</li>
          <li>4. Retire seu pedido e aproveite!</li>
        </ol>
      </div>

      <p className={`mt-4 text-sm ${
        isDarkMode ? 'text-gray-300' : 'text-gray-600'
      }`}>
        Recomendamos que você faça uma captura de tela ou anote o token.
      </p>

      <Link
        to="/pedidos"
        className="block w-full py-3 mt-6 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
      >
        Ver Meus Pedidos
      </Link>
    </div>
  );
}; 