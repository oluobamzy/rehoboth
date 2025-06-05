'use client';

import { useState } from 'react';

// Event types for filtering
const EVENT_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'service', label: 'Service' },
  { value: 'study', label: 'Bible Study' },
  { value: 'social', label: 'Social' },
  { value: 'outreach', label: 'Outreach' },
];

// Event categories for filtering
const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'worship', label: 'Worship' },
  { value: 'youth', label: 'Youth' },
  { value: 'family', label: 'Family' },
  { value: 'adult', label: 'Adult' },
  { value: 'missions', label: 'Missions' },
  { value: 'community', label: 'Community' },
];

export default function EventFilters({ filters, onFilterChange }) {
  // Local state for search input (to prevent excessive API calls while typing)
  const [searchInput, setSearchInput] = useState(filters.query || '');
  
  // Handle input changes
  const handleInputChange = (e) => {
    setSearchInput(e.target.value);
  };
  
  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    onFilterChange({ query: searchInput });
  };
  
  // Handle select changes
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value || null });
  };
  
  // Handle date changes
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value || null });
  };
  
  // Handle featured toggle
  const handleFeaturedToggle = () => {
    onFilterChange({ featured: filters.featured ? null : true });
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex mb-4">
        <input
          type="text"
          placeholder="Search events..."
          className="flex-1 p-2 border rounded-l-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          value={searchInput}
          onChange={handleInputChange}
        />
        <button
          type="submit"
          className="bg-primary-600 text-white px-4 py-2 rounded-r-md hover:bg-primary-700"
        >
          Search
        </button>
      </form>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Event Type Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Event Type
          </label>
          <select
            name="eventType"
            value={filters.eventType || ''}
            onChange={handleSelectChange}
            className="w-full border rounded p-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {EVENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Category Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            name="category"
            value={filters.category || ''}
            onChange={handleSelectChange}
            className="w-full border rounded p-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Date From */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Date
          </label>
          <input
            type="date"
            name="fromDate"
            value={filters.fromDate || ''}
            onChange={handleDateChange}
            className="w-full border rounded p-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        {/* Date To */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To Date
          </label>
          <input
            type="date"
            name="toDate"
            value={filters.toDate || ''}
            onChange={handleDateChange}
            className="w-full border rounded p-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>
      
      {/* Additional filters */}
      <div className="flex items-center mt-4">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={filters.featured || false}
            onChange={handleFeaturedToggle}
          />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          <span className="ml-2 text-sm font-medium text-gray-700">Featured Events Only</span>
        </label>
      </div>
    </div>
  );
}
