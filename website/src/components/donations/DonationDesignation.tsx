'use client';

{/* src/components/donations/DonationDesignation.tsx */}
import { useEffect, useState } from 'react';
import { DonationDesignation as DesignationType } from '@/types/donations';

interface DonationDesignationProps {
  selectedDesignation: string;
  updateFormData: (data: { designationId: string }) => void;
}

export default function DonationDesignation({
  selectedDesignation,
  updateFormData,
}: DonationDesignationProps) {
  const [designations, setDesignations] = useState<DesignationType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch donation designations when component mounts
  useEffect(() => {
    async function fetchDesignations() {
      try {
        const response = await fetch('/api/donations/designations');
        if (!response.ok) {
          throw new Error('Failed to fetch donation designations');
        }
        
        const data = await response.json();
        setDesignations(data.designations);
        
        // If there are designations and no selection, select the first one
        if (data.designations.length > 0 && !selectedDesignation) {
          updateFormData({ designationId: data.designations[0].name });
        }
      } catch (err) {
        console.error('Error fetching donation designations:', err);
        setError('Unable to load donation funds. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchDesignations();
  }, [selectedDesignation, updateFormData]);
  
  const handleSelectDesignation = (designationId: string) => {
    updateFormData({ designationId });
  };
  
  if (isLoading) {
    return (
      <div className="py-4 text-center">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-l-transparent"></div>
        <p className="mt-2 text-gray-600">Loading donation funds...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">
        Select Fund
      </h2>
      
      <div className="grid gap-3">
        {designations.map((designation) => (
          <button
            key={designation.id}
            type="button"
            onClick={() => handleSelectDesignation(designation.name)}
            className={`px-4 py-3 border rounded-lg text-left flex justify-between items-center ${
              selectedDesignation === designation.name
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
            }`}
          >
            <div>
              <span className="font-medium">{designation.name}</span>
              {designation.description && (
                <p className={`text-sm ${
                  selectedDesignation === designation.name
                    ? 'text-blue-100'
                    : 'text-gray-500'
                }`}>
                  {designation.description}
                </p>
              )}
            </div>
            
            {designation.target_amount_cents && (
              <div className="text-right">
                {designation.current_amount_cents > 0 && (
                  <div className="w-32 bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, (designation.current_amount_cents / designation.target_amount_cents) * 100)}%` 
                      }}
                    />
                  </div>
                )}
                <span className={`text-xs ${
                  selectedDesignation === designation.name
                    ? 'text-blue-100'
                    : 'text-gray-500'
                }`}>
                  ${(designation.current_amount_cents / 100).toLocaleString()} 
                  of ${(designation.target_amount_cents / 100).toLocaleString()}
                </span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
