'use client';

import Image from 'next/image'; 
import Link from 'next/link';
import { formatDate, formatTime } from '@/utils/dateUtils';

export default function EventCard({ event }) {
  // Format date and time
  const formattedDate = formatDate(event.start_datetime);
  const startTime = formatTime(event.start_datetime);
  const endTime = formatTime(event.end_datetime);
  
  // Calculate if registration is available
  const registrationAvailable = event.registration_required && 
    (!event.registration_deadline || new Date(event.registration_deadline) > new Date());
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Event Image */}
      <div className="relative w-full h-48">
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-lg">No Image</span>
          </div>
        )}
        
        {/* Featured badge */}
        {event.is_featured && (
          <span className="absolute top-2 right-2 bg-primary-600 text-white text-sm px-3 py-1 rounded-full">
            Featured
          </span>
        )}
        
        {/* Event type tag */}
        <span className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {event.event_type}
        </span>
      </div>
      
      {/* Event details */}
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2 line-clamp-2">
          {event.title}
        </h3>
        
        <div className="mb-4">
          <div className="flex items-center text-gray-600 mb-1">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formattedDate}</span>
          </div>
          
          <div className="flex items-center text-gray-600 mb-1">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{startTime} - {endTime}</span>
          </div>
          
          {event.location_name && (
            <div className="flex items-center text-gray-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{event.location_name}</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-4">
          {/* Cost indicator */}
          <div>
            {event.cost_cents > 0 ? (
              <span className="text-gray-700 font-medium">
                ${(event.cost_cents / 100).toFixed(2)}
              </span>
            ) : (
              <span className="text-green-600 font-medium">Free</span>
            )}
          </div>
          
          {/* View details button */}
          <Link href={`/events/${event.id}`} className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition-colors">
            Details
          </Link>
        </div>
        
        {/* Registration status */}
        {registrationAvailable && (
          <div className="mt-2 text-center text-sm text-primary-700">
            Registration open
          </div>
        )}
      </div>
    </div>
  );
}
