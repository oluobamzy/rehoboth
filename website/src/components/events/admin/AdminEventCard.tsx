'use client';

import Link from 'next/link';
import { formatDate, formatTime } from '@/utils/dateUtils';
import { deleteEvent } from '@/services/eventService';
import { useState } from 'react';
import { Event } from '@/hooks/useEvents';

interface AdminEventCardProps {
  event: Event;
}

export default function AdminEventCard({ event }: AdminEventCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  
  if (!event) return null;
  
  // Format date and time
  const formattedDate = formatDate(event.start_datetime);
  const startTime = formatTime(event.start_datetime);
  
  // Handle delete click
  const handleDeleteClick = async () => {
    if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
      setIsDeleting(true);
      try {
        const { success, error } = await deleteEvent(event.id);
        
        if (!success) {
          throw new Error(error || 'Failed to delete event');
        }
        
        // Refresh the page after successful deletion
        window.location.reload();
      } catch (err) {
        console.error('Error deleting event:', err);
        alert("Failed to delete event. Please try again.");
        setIsDeleting(false);
      }
    }
  };

  return (
    <tr>
      <td className="px-6 py-4 whitespace-normal">
        <div className="flex items-start">
          {/* Event image thumbnail */}
          {event.image_url && (
            <div className="flex-shrink-0 h-10 w-10 mr-3">
              <img 
                className="h-10 w-10 rounded-md object-cover" 
                src={event.image_url} 
                alt="" 
              />
            </div>
          )}
          <div>
            <div className="text-sm font-medium text-gray-900">{event.title}</div>
            <div className="text-sm text-gray-500 truncate max-w-md">
              {event.description?.substring(0, 60)}
              {event.description && event.description.length > 60 ? '...' : ''}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{formattedDate}</div>
        <div className="text-sm text-gray-500">{startTime}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
          {event.event_type}
        </span>
        {event.category && (
          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            {event.category}
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {event.registration_required ? (
          <span className="text-green-600 text-sm">Required</span>
        ) : (
          <span className="text-gray-500 text-sm">Not required</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {event.is_published ? (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            Published
          </span>
        ) : (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Draft
          </span>
        )}
        {event.is_featured && (
          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
            Featured
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className="flex space-x-3">
          <Link
            href={`/admin/events/${event.id}`}
            className="text-indigo-600 hover:text-indigo-900"
          >
            View
          </Link>
          <Link
            href={`/admin/events/${event.id}/edit`}
            className="text-blue-600 hover:text-blue-900"
          >
            Edit
          </Link>
          {event.registration_required && (
            <Link
              href={`/admin/events/${event.id}/registrations`}
              className="text-green-600 hover:text-green-900"
            >
              Registrations
            </Link>
          )}
          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-900 focus:outline-none"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </td>
    </tr>
  );
}
