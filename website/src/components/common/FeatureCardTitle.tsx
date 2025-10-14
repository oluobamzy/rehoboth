'use client';

import { useState, useEffect } from 'react';

interface FeatureCardTitlesData {
  sunday_services: string;
  latest_sermons: string;
  giving_back: string;
}

interface FeatureCardTitleProps {
  pageKey: string;
  sectionKey: string;
  cardType: 'sunday_services' | 'latest_sermons' | 'giving_back';
  className?: string;
}

export default function FeatureCardTitle({
  pageKey,
  sectionKey,
  cardType,
  className = ''
}: FeatureCardTitleProps) {
  const [data, setData] = useState<FeatureCardTitlesData>({
    sunday_services: "Sunday Services",
    latest_sermons: "Latest Sermons",
    giving_back: "Giving Back"
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTitles();
  }, [pageKey, sectionKey]);

  const fetchTitles = async () => {
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
      console.error('Error fetching feature card titles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  return (
    <h3 className={`text-xl sm:text-2xl font-bold mb-3 text-blue-900 ${className}`}>
      {data[cardType]}
    </h3>
  );
}