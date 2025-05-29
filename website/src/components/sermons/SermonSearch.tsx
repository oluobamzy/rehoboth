"use client";

import React, { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchTags, fetchSpeakers } from '@/services/sermonService';
import { useQuery } from '@tanstack/react-query';

export default function SermonSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get current query parameters
  const currentQuery = searchParams?.get('query') || '';
  const currentSpeaker = searchParams?.get('speaker') || '';
  const currentTag = searchParams?.get('tag') || '';
  const currentDateFrom = searchParams?.get('date_from') || '';
  const currentDateTo = searchParams?.get('date_to') || '';
  
  // Local state for form inputs
  const [searchQuery, setSearchQuery] = useState(currentQuery);
  const [selectedSpeaker, setSelectedSpeaker] = useState(currentSpeaker);
  const [selectedTag, setSelectedTag] = useState(currentTag);
  const [dateFrom, setDateFrom] = useState(currentDateFrom);
  const [dateTo, setDateTo] = useState(currentDateTo);
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch available speakers
  const { data: speakers = [] } = useQuery({
    queryKey: ['speakers'],
    queryFn: fetchSpeakers,
  });
  
  // Fetch available tags
  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: fetchTags,
  });

  // Handle search submission
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Build query string
    const params = new URLSearchParams();
    if (searchQuery) params.set('query', searchQuery);
    if (selectedSpeaker) params.set('speaker', selectedSpeaker);
    if (selectedTag) params.set('tag', selectedTag);
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    
    // Always reset to page 1 when changing search
    params.set('page', '1');
    
    // Navigate to search results
    router.push(`/sermons?${params.toString()}`);
  };
  
  // Handle clearing filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSpeaker('');
    setSelectedTag('');
    setDateFrom('');
    setDateTo('');
    
    // Navigate to clean URL
    router.push('/sermons');
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery || selectedSpeaker || selectedTag || dateFrom || dateTo;

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-4 mb-8">
      <form onSubmit={handleSearch}>
        {/* Basic search with expandable filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search input */}
          <div className="flex-grow">
            <div className="relative">
              <input
                type="search"
                placeholder="Search sermons..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </div>
          </div>
          
          {/* Search button */}
          <button
            type="submit"
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
          >
            Search
          </button>
          
          {/* Toggle filters button */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Filters {isExpanded ? '▲' : '▼'}
          </button>
        </div>
        
        {/* Expanded filters */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 animate-fadeIn">
            {/* Speaker filter */}
            <div>
              <label htmlFor="speaker" className="block text-sm font-medium text-gray-700 mb-1">
                Speaker
              </label>
              <select
                id="speaker"
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                value={selectedSpeaker}
                onChange={(e) => setSelectedSpeaker(e.target.value)}
              >
                <option value="">All Speakers</option>
                {speakers.map((speaker) => (
                  <option key={speaker} value={speaker}>
                    {speaker}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Tag filter */}
            <div>
              <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-1">
                Tag
              </label>
              <select
                id="tag"
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
              >
                <option value="">All Tags</option>
                {tags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Date from */}
            <div>
              <label htmlFor="date-from" className="block text-sm font-medium text-gray-700 mb-1">
                From
              </label>
              <input
                type="date"
                id="date-from"
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            
            {/* Date to */}
            <div>
              <label htmlFor="date-to" className="block text-sm font-medium text-gray-700 mb-1">
                To
              </label>
              <input
                type="date"
                id="date-to"
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        )}
        
        {/* Active filters and clear button */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center mt-4 text-sm">
            <span className="text-gray-600 mr-2">Active filters:</span>
            {searchQuery && (
              <span className="bg-gray-100 px-2 py-1 rounded-full text-gray-700 mr-2 mb-1">
                &quot;{searchQuery}&quot;
              </span>
            )}
            {selectedSpeaker && (
              <span className="bg-gray-100 px-2 py-1 rounded-full text-gray-700 mr-2 mb-1">
                Speaker: {selectedSpeaker}
              </span>
            )}
            {selectedTag && (
              <span className="bg-gray-100 px-2 py-1 rounded-full text-gray-700 mr-2 mb-1">
                Tag: {selectedTag}
              </span>
            )}
            {dateFrom && (
              <span className="bg-gray-100 px-2 py-1 rounded-full text-gray-700 mr-2 mb-1">
                From: {dateFrom}
              </span>
            )}
            {dateTo && (
              <span className="bg-gray-100 px-2 py-1 rounded-full text-gray-700 mr-2 mb-1">
                To: {dateTo}
              </span>
            )}
            <button
              type="button"
              onClick={clearFilters}
              className="text-orange-600 hover:text-orange-800 ml-auto focus:outline-none font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
