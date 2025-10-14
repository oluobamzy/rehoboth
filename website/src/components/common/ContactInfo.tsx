'use client';

import { useState, useEffect } from 'react';

interface ContactInfoData {
  phone: string;
  email: string;
  address: string;
}

interface ContactInfoProps {
  pageKey: string;
  sectionKey: string;
  className?: string;
}

export default function ContactInfo({
  pageKey,
  sectionKey,
  className = ''
}: ContactInfoProps) {
  const [data, setData] = useState<ContactInfoData>({
    phone: "613-400-4966",
    email: "rehobothchristianchurch2022@gmail.com",
    address: "Your Church Address Here"
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchContactInfo();
  }, [pageKey, sectionKey]);

  const fetchContactInfo = async () => {
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
      console.error('Error fetching contact info:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 text-sm sm:text-base text-gray-600 ${className}`}>
      <div className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 flex-shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        <span>{data.phone}</span>
      </div>
      <div className="flex items-start">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 mt-0.5 flex-shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span className="break-all">{data.email}</span>
      </div>
      <div className="flex items-start">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 mt-0.5 flex-shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>{data.address}</span>
      </div>
    </div>
  );
}