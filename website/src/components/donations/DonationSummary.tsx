'use client';

{/* src/components/donations/DonationSummary.tsx */}
import { DonationFormData } from '@/types/donations';

interface DonationSummaryProps {
  formData: DonationFormData;
}

export default function DonationSummary({ formData }: DonationSummaryProps) {
  const amount = formData.customAmount 
    ? parseFloat(formData.customAmount) 
    : formData.amount;
  
  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <h3 className="font-semibold text-gray-800 mb-3">
        Donation Summary
      </h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Amount:</span>
          <span className="font-medium text-gray-800">
            ${amount.toFixed(2)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Fund:</span>
          <span className="font-medium text-gray-800">
            {formData.designationId || 'General Fund'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Frequency:</span>
          <span className="font-medium text-gray-800">
            {formData.isRecurring ? formData.frequency : 'One-time'}
          </span>
        </div>
        
        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex justify-between">
            <span className="text-gray-600">{formData.isRecurring ? 'Total per payment' : 'Total'}:</span>
            <span className="font-medium text-lg text-gray-800">
              ${amount.toFixed(2)}
            </span>
          </div>
          
          {formData.isRecurring && (
            <p className="mt-2 text-xs text-gray-500">
              Your card will be charged ${amount.toFixed(2)} {formData.frequency}.
              You can cancel your recurring donation at any time.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
