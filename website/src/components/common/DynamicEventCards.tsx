'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface EventCard {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  link?: string;
}

interface DynamicEventCardsProps {
  pageKey: string;
  sectionKey: string;
  maxCards?: number;
  className?: string;
}

export default function DynamicEventCards({
  pageKey,
  sectionKey,
  maxCards = 3,
  className = ''
}: DynamicEventCardsProps) {
  const [eventCards, setEventCards] = useState<EventCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEventCards();
  }, [pageKey, sectionKey]);

  const fetchEventCards = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/content/events?page_key=${encodeURIComponent(pageKey)}&section_key=${encodeURIComponent(sectionKey)}&limit=${maxCards}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          // No events found, use default fallback
          setEventCards(getDefaultEventCards());
          setIsLoading(false);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.events && data.events.length > 0) {
        setEventCards(data.events.slice(0, maxCards));
      } else {
        setEventCards(getDefaultEventCards());
      }
    } catch (err) {
      console.error('Error fetching event cards:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch event cards');
      setEventCards(getDefaultEventCards());
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultEventCards = (): EventCard[] => {
    return [
      {
        id: 'default-1',
        title: 'Sunday Worship Service',
        date: 'SUNDAY, JUNE 23, 2025',
        time: '3:00 PM - 6:00 PM',
        location: 'Main Sanctuary',
        description: 'Join us for worship, prayer, and an inspiring message from Pastor Patrick.',
        link: '/events/sunday-worship'
      },
      {
        id: 'default-2',
        title: 'Prayer Service',
        date: 'WEDNESDAY, JUNE 26, 2025',
        time: '7:00 PM - 9:00 PM',
        location: 'Fellowship Hall',
        description: 'Join us for our midweek prayer service where we come together to pray and seek God\'s guidance.',
        link: '/events/bible-study'
      },
      {
        id: 'default-3',
        title: 'Community Outreach',
        date: 'SATURDAY, JUNE 29, 2025',
        time: '9:00 AM - 12:00 PM',
        location: 'Community Center',
        description: 'Volunteer with us as we serve our local community through this family-friendly event.',
        link: '/events/outreach'
      }
    ];
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }).toUpperCase();
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className={`grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr ${className}`}>
        {[...Array(maxCards)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 animate-pulse">
            <div className="bg-gray-300 h-12"></div>
            <div className="p-6 space-y-3">
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    console.warn('Event cards error:', error);
  }

  return (
    <div className={`grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr ${className}`}>
      {eventCards.map((event, index) => (
        <div key={event.id} className={`bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 flex flex-col${index === eventCards.length - 1 && eventCards.length === 3 ? ' sm:col-span-1 md:col-span-2 lg:col-span-1' : ''}`}>
          <div className="bg-blue-600 text-white p-3 text-center font-bold text-sm sm:text-base">
            {formatDate(event.date)}
          </div>
          <div className="p-4 sm:p-6 flex-grow flex flex-col">
            <h3 className="text-lg sm:text-xl font-semibold mb-2">{event.title}</h3>
            <div className="flex items-center mb-3 text-gray-600 text-sm sm:text-base">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {event.time}
            </div>
            <div className="flex items-center mb-4 text-gray-600 text-sm sm:text-base">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {event.location}
            </div>
            <p className="text-gray-600 mb-4 flex-grow text-sm sm:text-base">{event.description}</p>
            {event.link && (
              <Link href={event.link}>
                <button className="w-full bg-gray-100 hover:bg-green-50 text-green-600 py-2 sm:py-3 rounded-md font-medium transition-colors text-sm sm:text-base">
                  Event Details
                </button>
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}