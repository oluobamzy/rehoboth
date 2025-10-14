'use client';

import { useState, useEffect } from 'react';

interface ServiceTimesData {
  sunday_worship: string;
  wednesday_prayer: string;
}

interface ServiceTimesProps {
  pageKey: string;
  sectionKey: string;
  className?: string;
}

export default function ServiceTimes({
  pageKey,
  sectionKey,
  className = ''
}: ServiceTimesProps) {
  const [data, setData] = useState<ServiceTimesData>({
    sunday_worship: "Sunday Worship: 3:00 PM - 6:00 PM",
    wednesday_prayer: "Wednesday Prayer: 7:00 PM - 9:00 PM"
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchServiceTimes();
  }, [pageKey, sectionKey]);

  const fetchServiceTimes = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(
        `/api/content/structured?page_key=${encodeURIComponent(pageKey)}&section_key=${encodeURIComponent(sectionKey)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.content && result.content.metadata) {
          setData(result.content.metadata);
        }
      }
    } catch (err) {
      console.error('Error fetching service times:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 text-sm sm:text-base text-gray-600 ${className}`}>
      <div className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 flex-shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{data.sunday_worship}</span>
      </div>
      <div className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 flex-shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{data.wednesday_prayer}</span>
      </div>
    </div>
  );
}