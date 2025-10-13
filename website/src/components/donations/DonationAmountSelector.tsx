'use client';

{/* src/components/donations/DonationAmountSelector.tsx */}
import { useState } from 'react';

interface DonationAmountSelectorProps {
  selectedAmount: number;
  customAmount: string;
  updateFormData: (data: {
    amount?: number;
    customAmount?: string;
  }) => void;
}

const PRESET_AMOUNTS = [25, 50, 100, 250, 500];

export default function DonationAmountSelector({
  selectedAmount,
  customAmount,
  updateFormData,
}: DonationAmountSelectorProps) {
  const [isCustom, setIsCustom] = useState<boolean>(customAmount !== '');
  
  const handleAmountSelect = (amount: number) => {
    updateFormData({ amount, customAmount: '' });
    setIsCustom(false);
  };
  
  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow only numbers and decimals
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      updateFormData({ customAmount: value });
      setIsCustom(true);
      
      // If there's a valid number, update the amount as well
      if (value !== '' && !isNaN(parseFloat(value))) {
        updateFormData({ amount: parseFloat(value), customAmount: value });
      }
    }
  };
  
  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
        Select Donation Amount
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {PRESET_AMOUNTS.map((amount) => (
          <button
            key={amount}
            type="button"
            className={`px-3 sm:px-4 py-3 sm:py-4 border rounded-lg text-center font-medium transition-all duration-200 text-sm sm:text-base ${
              !isCustom && selectedAmount === amount
                ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:shadow-sm'
            }`}
            onClick={() => handleAmountSelect(amount)}
          >
            ${amount}
          </button>
        ))}
        
        <div
          className={`col-span-2 sm:col-span-3 lg:col-span-5 mt-2 sm:mt-3 border rounded-lg p-3 sm:p-4 flex items-center transition-all duration-200 ${
            isCustom
              ? 'border-blue-600 ring-1 ring-blue-600 shadow-sm'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <span className="text-gray-500 px-2 text-sm sm:text-base font-medium">$</span>
          <input
            type="text"
            value={customAmount}
            onChange={handleCustomChange}
            onFocus={() => setIsCustom(true)}
            placeholder="Other Amount"
            className="flex-1 outline-none text-sm sm:text-base bg-transparent"
            aria-label="Custom donation amount"
          />
        </div>
      </div>
      
      <p className="text-xs sm:text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg">
        All donations are tax-deductible to the extent allowed by law.
      </p>
    </div>
  );
}
