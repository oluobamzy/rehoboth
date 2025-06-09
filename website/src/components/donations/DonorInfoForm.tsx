'use client';

{/* src/components/donations/DonorInfoForm.tsx */}
import { useState } from 'react';

interface DonorInfoFormProps {
  donorName: string;
  donorEmail: string;
  agreeToTerms: boolean;
  onBack: () => void;
  onNext: (data: {
    donorName: string;
    donorEmail: string;
    agreeToTerms: boolean;
  }) => void;
}

export default function DonorInfoForm({
  donorName,
  donorEmail,
  agreeToTerms,
  onBack,
  onNext,
}: DonorInfoFormProps) {
  const [formData, setFormData] = useState({
    donorName: donorName,
    donorEmail: donorEmail,
    agreeToTerms: agreeToTerms,
  });
  
  const [errors, setErrors] = useState<{
    donorName?: string;
    donorEmail?: string;
    agreeToTerms?: string;
  }>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors: {
      donorName?: string;
      donorEmail?: string;
      agreeToTerms?: string;
    } = {};
    
    if (!formData.donorName.trim()) {
      newErrors.donorName = 'Please enter your name';
    }
    
    if (!formData.donorEmail.trim()) {
      newErrors.donorEmail = 'Please enter your email address';
    } else if (!/\S+@\S+\.\S+/.test(formData.donorEmail)) {
      newErrors.donorEmail = 'Please enter a valid email address';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms to continue';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onNext(formData);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Your Information
        </h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="donorName" className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="donorName"
              name="donorName"
              value={formData.donorName}
              onChange={handleChange}
              className={`block w-full py-2 px-3 border ${
                errors.donorName ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              autoComplete="name"
            />
            {errors.donorName && (
              <p className="mt-1 text-sm text-red-600">{errors.donorName}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="donorEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="donorEmail"
              name="donorEmail"
              value={formData.donorEmail}
              onChange={handleChange}
              className={`block w-full py-2 px-3 border ${
                errors.donorEmail ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              autoComplete="email"
            />
            {errors.donorEmail && (
              <p className="mt-1 text-sm text-red-600">{errors.donorEmail}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              We'll use this to send your donation receipt.
            </p>
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className={`h-4 w-4 rounded border ${
                  errors.agreeToTerms ? 'border-red-500' : 'border-gray-300'
                } focus:ring-blue-500 text-blue-600`}
              />
            </div>
            <div className="ml-3">
              <label htmlFor="agreeToTerms" className={`text-sm ${
                errors.agreeToTerms ? 'text-red-500' : 'text-gray-700'
              }`}>
                I agree that I am making this donation voluntarily and understand it is non-refundable.
              </label>
              {errors.agreeToTerms && (
                <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 bg-gray-100 text-gray-800 font-medium rounded hover:bg-gray-200"
        >
          Back
        </button>
        
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700"
        >
          Continue
        </button>
      </div>
    </form>
  );
}
