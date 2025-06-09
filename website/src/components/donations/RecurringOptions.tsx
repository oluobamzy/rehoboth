'use client';

{/* src/components/donations/RecurringOptions.tsx */}
import { DONATION_FREQUENCIES } from '@/types/donations';

interface RecurringOptionsProps {
  isRecurring: boolean;
  frequency: string;
  updateFormData: (data: {
    isRecurring: boolean;
    frequency?: string;
  }) => void;
}

export default function RecurringOptions({
  isRecurring,
  frequency,
  updateFormData,
}: RecurringOptionsProps) {
  const handleRecurringToggle = (value: boolean) => {
    updateFormData({ isRecurring: value });
  };
  
  const handleFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFormData({ isRecurring: true, frequency: e.target.value });
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">
        Donation Frequency
      </h2>
      
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className={`px-4 py-3 border rounded-lg text-center ${
            !isRecurring
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
          }`}
          onClick={() => handleRecurringToggle(false)}
        >
          One-Time
        </button>
        
        <button
          type="button"
          className={`px-4 py-3 border rounded-lg text-center ${
            isRecurring
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
          }`}
          onClick={() => handleRecurringToggle(true)}
        >
          Recurring
        </button>
      </div>
      
      {isRecurring && (
        <div className="mt-4">
          <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
            Frequency
          </label>
          <select
            id="frequency"
            value={frequency}
            onChange={handleFrequencyChange}
            className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={DONATION_FREQUENCIES.WEEKLY}>Weekly</option>
            <option value={DONATION_FREQUENCIES.BIWEEKLY}>Biweekly</option>
            <option value={DONATION_FREQUENCIES.MONTHLY}>Monthly</option>
            <option value={DONATION_FREQUENCIES.QUARTERLY}>Quarterly</option>
            <option value={DONATION_FREQUENCIES.ANNUALLY}>Annually</option>
          </select>
          
          <p className="mt-2 text-sm text-gray-600">
            Recurring donations will automatically process on this schedule until canceled.
            You can manage your recurring donations at any time.
          </p>
        </div>
      )}
    </div>
  );
}
