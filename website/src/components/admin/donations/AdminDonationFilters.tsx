// src/components/admin/donations/AdminDonationFilters.tsx
'use client';

import { useState } from 'react';
import { DonationDesignation } from '@/types/donations';
import { FiFilter, FiX } from 'react-icons/fi';

interface FiltersProps {
  filters: {
    startDate: string;
    endDate: string;
    minAmount: string;
    maxAmount: string;
    donorEmail: string;
    fundDesignation: string;
  };
  onFilterChange: (filters: any) => void;
  designations: DonationDesignation[];
}

export default function AdminDonationFilters({ filters, onFilterChange, designations }: FiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(localFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      donorEmail: '',
      fundDesignation: ''
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium text-gray-900">Filter Donations</h3>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="flex items-center px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
              type="button"
            >
              <FiX className="mr-1" /> Clear Filters
            </button>
          )}
          <button
            onClick={() => setIsExpanded(prev => !prev)}
            className="flex items-center px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
            type="button"
          >
            <FiFilter className="mr-1" /> {isExpanded ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label htmlFor="startDate" className="text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={localFilters.startDate}
              onChange={handleInputChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="space-y-1">
            <label htmlFor="endDate" className="text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={localFilters.endDate}
              onChange={handleInputChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="space-y-1">
            <label htmlFor="donorEmail" className="text-sm font-medium text-gray-700">Donor Email</label>
            <input
              type="email"
              id="donorEmail"
              name="donorEmail"
              placeholder="donor@example.com"
              value={localFilters.donorEmail}
              onChange={handleInputChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="space-y-1">
            <label htmlFor="minAmount" className="text-sm font-medium text-gray-700">Min Amount ($)</label>
            <input
              type="number"
              id="minAmount"
              name="minAmount"
              placeholder="0"
              step="0.01"
              value={localFilters.minAmount}
              onChange={handleInputChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="space-y-1">
            <label htmlFor="maxAmount" className="text-sm font-medium text-gray-700">Max Amount ($)</label>
            <input
              type="number"
              id="maxAmount"
              name="maxAmount"
              placeholder="No limit"
              step="0.01"
              value={localFilters.maxAmount}
              onChange={handleInputChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="space-y-1">
            <label htmlFor="fundDesignation" className="text-sm font-medium text-gray-700">Designation</label>
            <select
              id="fundDesignation"
              name="fundDesignation"
              value={localFilters.fundDesignation}
              onChange={handleInputChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Designations</option>
              <option value="General">General Fund</option>
              {designations.map((designation) => (
                <option key={designation.id} value={designation.name}>
                  {designation.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="col-span-full flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
