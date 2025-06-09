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
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">
        Select Donation Amount
      </h2>
      
      <div className="grid grid-cols-3 gap-3">
        {PRESET_AMOUNTS.map((amount) => (
          <button
            key={amount}
            type="button"
            className={`px-4 py-3 border rounded-lg text-center ${
              !isCustom && selectedAmount === amount
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
            }`}
            onClick={() => handleAmountSelect(amount)}
          >
            ${amount}
          </button>
        ))}
        
        <div
          className={`col-span-3 mt-2 border rounded-lg p-2 flex items-center ${
            isCustom
              ? 'border-blue-600 ring-1 ring-blue-600'
              : 'border-gray-300'
          }`}
        >
          <span className="text-gray-500 px-2">$</span>
          <input
            type="text"
            value={customAmount}
            onChange={handleCustomChange}
            onFocus={() => setIsCustom(true)}
            placeholder="Other Amount"
            className="flex-1 outline-none"
            aria-label="Custom donation amount"
          />
        </div>
      </div>
      
      <p className="text-sm text-gray-600 italic">
        All donations are tax-deductible to the extent allowed by law.
      </p>
    </div>
  );
}
