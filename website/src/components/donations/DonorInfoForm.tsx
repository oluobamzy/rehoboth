'use client';

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
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">
          Your Information
        </h2>
        
        <div className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="donorName" className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="donorName"
              name="donorName"
              value={formData.donorName}
              onChange={handleChange}
              className={`w-full px-3 sm:px-4 py-3 sm:py-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base ${
                errors.donorName
                  ? 'border-red-500 ring-1 ring-red-500'
                  : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
              autoComplete="name"
            />
            {errors.donorName && (
              <p className="mt-2 text-xs sm:text-sm text-red-600">
                {errors.donorName}
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="donorEmail" className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="donorEmail"
              name="donorEmail"
              value={formData.donorEmail}
              onChange={handleChange}
              className={`w-full px-3 sm:px-4 py-3 sm:py-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base ${
                errors.donorEmail
                  ? 'border-red-500 ring-1 ring-red-500'
                  : 'border-gray-300'
              }`}
              placeholder="your.email@example.com"
              autoComplete="email"
            />
            {errors.donorEmail && (
              <p className="mt-2 text-xs sm:text-sm text-red-600">
                {errors.donorEmail}
              </p>
            )}
          </div>
          
          <div className="pt-2">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors ${
                    errors.agreeToTerms ? 'border-red-500' : ''
                  }`}
                />
              </div>
              <div className="ml-3 text-sm sm:text-base">
                <label htmlFor="agreeToTerms" className="text-gray-700">
                  I agree to the{' '}
                  <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                  <span className="text-red-500 ml-1">*</span>
                </label>
              </div>
            </div>
            {errors.agreeToTerms && (
              <p className="mt-2 text-xs sm:text-sm text-red-600">
                {errors.agreeToTerms}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base font-medium"
        >
          Back
        </button>
        <button
          type="submit"
          className="w-full sm:flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-sm sm:text-base font-medium"
        >
          Continue to Payment
        </button>
      </div>
    </form>
  );
}
