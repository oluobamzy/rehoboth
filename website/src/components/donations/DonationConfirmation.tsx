'use client';

{/* src/components/donations/DonationConfirmation.tsx */}
import Link from 'next/link';
import { DonationFormData } from '@/types/donations';

interface DonationConfirmationProps {
  formData: DonationFormData;
  resetForm: () => void;
}

export default function DonationConfirmation({
  formData,
  resetForm,
}: DonationConfirmationProps) {
  const amount = formData.customAmount
    ? parseFloat(formData.customAmount)
    : formData.amount;
  
  return (
    <div className="text-center space-y-6">
      <svg
        className="mx-auto h-16 w-16 text-green-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
      
      <h2 className="text-2xl font-bold text-gray-900">
        Thank You for Your Donation!
      </h2>
      
      <div className="max-w-md mx-auto">
        <p className="text-gray-600 mb-4">
          {formData.isRecurring ? (
            <>
              Your {formData.frequency} recurring donation of <span className="font-medium">${amount.toFixed(2)}</span> to {formData.designationId || 'General Fund'} has been set up successfully.
            </>
          ) : (
            <>
              Your donation of <span className="font-medium">${amount.toFixed(2)}</span> to {formData.designationId || 'General Fund'} has been processed successfully.
            </>
          )}
        </p>
        
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-left mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">
            Donation Details
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="text-gray-800">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="text-gray-800">${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fund:</span>
              <span className="text-gray-800">{formData.designationId || 'General Fund'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="text-gray-800">
                {formData.isRecurring ? `Recurring (${formData.frequency})` : 'One-time'}
              </span>
            </div>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4">
          A receipt has been sent to <span className="font-medium">{formData.donorEmail}</span>.
        </p>
        
        {formData.isRecurring && (
          <p className="text-gray-600 mb-6">
            You can manage your recurring donations by contacting our finance team.
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            type="button"
            onClick={resetForm}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700"
          >
            Make Another Donation
          </button>
          
          <Link
            href="/"
            className="px-6 py-2 bg-gray-100 text-gray-800 font-medium rounded hover:bg-gray-200"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
