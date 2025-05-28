import { X } from 'lucide-react';
import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { CartItem } from '../../types/order';
import { OrderConfirmation } from './OrderConfirmation';
import { PixPayment } from './PixPayment';
import { ThankYou } from './ThankYou';

interface CheckoutFlowProps {
  cartItems: CartItem[];
  cartTotal: number;
  onClose: () => void;
}

type CheckoutStep = 'confirmation' | 'payment' | 'thank-you';

export const CheckoutFlow: React.FC<CheckoutFlowProps> = ({
  cartItems,
  cartTotal,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('confirmation');
  const [customerName, setCustomerName] = useState('');
  const [token, setToken] = useState('');
  const { isDarkMode } = useTheme();

  const handleConfirmation = (name: string) => {
    setCustomerName(name);
    setCurrentStep('payment');
  };

  const handlePaymentComplete = (generatedToken: string) => {
    setToken(generatedToken);
    setCurrentStep('thank-you');
  };

  const handleClose = () => {
    if (currentStep !== 'thank-you') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="relative w-full max-w-md">
        {currentStep !== 'thank-you' && (
          <button
            onClick={handleClose}
            className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors z-50 ${
              isDarkMode 
                ? 'bg-[#3C2A1F] text-white hover:bg-[#4C3A2F]' 
                : 'bg-white text-gray-800 hover:bg-gray-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {currentStep === 'confirmation' && (
          <OrderConfirmation
            cartItems={cartItems}
            cartTotal={cartTotal}
            onContinue={handleConfirmation}
          />
        )}

        {currentStep === 'payment' && (
          <PixPayment
            amount={cartTotal}
            customerName={customerName}
            onPaymentComplete={handlePaymentComplete}
          />
        )}

        {currentStep === 'thank-you' && (
          <ThankYou
            customerName={customerName}
            token={token}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}; 