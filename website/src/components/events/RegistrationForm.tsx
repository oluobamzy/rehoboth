'use client';

import { useState } from 'react';
import { useEventRegistration } from '@/hooks/useEvents';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function RegistrationForm({ eventId, onSuccess, onCancel }) {
  // Form state
  const [formData, setFormData] = useState({
    attendee_name: '',
    attendee_email: '',
    attendee_phone: '',
    party_size: 1,
    special_requests: '',
  });

  // Validation state
  const [errors, setErrors] = useState({});

  // Registration mutation
  const { mutate: registerForEvent, isPending, error } = useEventRegistration();

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear errors when field is updated
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!formData.attendee_name.trim()) {
      newErrors.attendee_name = 'Name is required';
    }
    
    if (!formData.attendee_email.trim()) {
      newErrors.attendee_email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.attendee_email)) {
      newErrors.attendee_email = 'Please enter a valid email';
    }
    
    if (formData.party_size < 1) {
      newErrors.party_size = 'Party size must be at least 1';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit registration
    registerForEvent(
      { eventId, registrationData: formData },
      {
        onSuccess: (data) => {
          if (onSuccess) {
            onSuccess(data);
          }
        },
      }
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Register for Event</h2>
      
      {/* Error message from mutation */}
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Name field */}
        <div className="mb-4">
          <label htmlFor="attendee_name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name*
          </label>
          <input
            type="text"
            id="attendee_name"
            name="attendee_name"
            value={formData.attendee_name}
            onChange={handleChange}
            className={`w-full border ${errors.attendee_name ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
          />
          {errors.attendee_name && (
            <p className="text-red-500 text-sm mt-1">{errors.attendee_name}</p>
          )}
        </div>
        
        {/* Email field */}
        <div className="mb-4">
          <label htmlFor="attendee_email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address*
          </label>
          <input
            type="email"
            id="attendee_email"
            name="attendee_email"
            value={formData.attendee_email}
            onChange={handleChange}
            className={`w-full border ${errors.attendee_email ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
          />
          {errors.attendee_email && (
            <p className="text-red-500 text-sm mt-1">{errors.attendee_email}</p>
          )}
        </div>
        
        {/* Phone field */}
        <div className="mb-4">
          <label htmlFor="attendee_phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="attendee_phone"
            name="attendee_phone"
            value={formData.attendee_phone}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        {/* Party size field */}
        <div className="mb-4">
          <label htmlFor="party_size" className="block text-sm font-medium text-gray-700 mb-1">
            Number of People*
          </label>
          <input
            type="number"
            id="party_size"
            name="party_size"
            value={formData.party_size}
            min="1"
            onChange={handleChange}
            className={`w-full border ${errors.party_size ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
          />
          {errors.party_size && (
            <p className="text-red-500 text-sm mt-1">{errors.party_size}</p>
          )}
        </div>
        
        {/* Special requests field */}
        <div className="mb-6">
          <label htmlFor="special_requests" className="block text-sm font-medium text-gray-700 mb-1">
            Special Requests or Accommodations
          </label>
          <textarea
            id="special_requests"
            name="special_requests"
            value={formData.special_requests}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        {/* Form buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isPending}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded transition-colors flex items-center justify-center"
          >
            {isPending ? <LoadingSpinner size="sm" /> : 'Register'}
          </button>
        </div>
      </form>
    </div>
  );
}
