// src/components/admin/donations/AdminDesignationForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { DonationDesignation, DonationDesignationInput } from '@/types/donations';
import { FiSave, FiTrash2 } from 'react-icons/fi';

interface AdminDesignationFormProps {
  designation?: DonationDesignation;
  onSave: () => void;
  onCancel: () => void;
}

export default function AdminDesignationForm({ designation, onSave, onCancel }: AdminDesignationFormProps) {
  const [formData, setFormData] = useState<DonationDesignationInput>({
    name: '',
    description: '',
    target_amount_cents: undefined,
    is_active: true,
    display_order: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with designation data if editing
  useEffect(() => {
    if (designation) {
      setFormData({
        name: designation.name,
        description: designation.description || '',
        target_amount_cents: designation.target_amount_cents,
        is_active: designation.is_active,
        display_order: designation.display_order,
      });
    }
  }, [designation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkboxes
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    // Handle number inputs
    if (type === 'number') {
      let numberValue: number | undefined = parseFloat(value);
      if (isNaN(numberValue)) numberValue = undefined;
      
      // Convert dollars to cents for target amount
      if (name === 'target_amount_dollars' && numberValue !== undefined) {
        setFormData(prev => ({ ...prev, target_amount_cents: Math.round(numberValue * 100) }));
        return;
      }
      
      setFormData(prev => ({ ...prev, [name]: numberValue }));
      return;
    }
    
    // Handle text inputs
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const method = designation ? 'PATCH' : 'POST';
      const url = designation 
        ? `/api/admin/donations/designations/${designation.id}`
        : '/api/admin/donations/designations';
        
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save designation');
      }
      
      // On success
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!designation) return;
    
    if (!confirm('Are you sure you want to delete this designation? This action cannot be undone.')) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/admin/donations/designations/${designation.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete designation');
      }
      
      // On success
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate target amount in dollars from cents
  const targetAmountDollars = formData.target_amount_cents !== undefined
    ? (formData.target_amount_cents / 100).toFixed(2)
    : '';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="e.g., Building Fund"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Describe the purpose of this designation"
          />
        </div>
        
        <div>
          <label htmlFor="target_amount_dollars" className="block text-sm font-medium text-gray-700">
            Target Amount ($)
          </label>
          <input
            type="number"
            id="target_amount_dollars"
            name="target_amount_dollars"
            value={targetAmountDollars}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Leave empty if no specific target"
          />
          <p className="mt-1 text-xs text-gray-500">
            Target amount for fundraising goals. Leave empty if there is no specific target.
          </p>
        </div>
        
        <div>
          <label htmlFor="display_order" className="block text-sm font-medium text-gray-700">
            Display Order
          </label>
          <input
            type="number"
            id="display_order"
            name="display_order"
            value={formData.display_order}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="0"
          />
          <p className="mt-1 text-xs text-gray-500">
            Order in which the designation appears in dropdown lists (lower numbers appear first)
          </p>
        </div>
        
        <div className="flex items-center">
          <input
            id="is_active"
            name="is_active"
            type="checkbox"
            checked={formData.is_active}
            onChange={handleInputChange}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
            Active
          </label>
          <p className="ml-4 text-xs text-gray-500">
            Only active designations are shown to donors
          </p>
        </div>
      </div>
      
      <div className="flex justify-between pt-4 border-t border-gray-200">
        <div>
          {designation && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              <FiTrash2 className="mr-2 h-4 w-4" />
              Delete
            </button>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <FiSave className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Saving...' : designation ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </form>
  );
}
