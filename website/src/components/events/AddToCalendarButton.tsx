'use client';

import { useState } from 'react';
import { formatDate, formatTime } from '@/utils/dateUtils';

export default function AddToCalendarButton({ event }) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!event) return null;
  
  // Format event details for calendar links
  const title = encodeURIComponent(event.title);
  const description = encodeURIComponent(event.description || '');
  const location = encodeURIComponent(event.location_name || event.location_address || '');
  
  // Format dates for different calendar services
  const startDate = new Date(event.start_datetime);
  const endDate = new Date(event.end_datetime);
  
  // Format for Google Calendar
  const googleStart = formatGoogleDate(startDate);
  const googleEnd = formatGoogleDate(endDate);
  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${googleStart}/${googleEnd}&details=${description}&location=${location}`;
  
  // Format for Outlook Calendar
  const outlookStart = formatOutlookDate(startDate);
  const outlookEnd = formatOutlookDate(endDate);
  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${outlookStart}&enddt=${outlookEnd}&body=${description}&location=${location}`;
  
  // Format for iCal download
  const iCalUrl = `/api/events/${event.id}/ical`;
  
  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={toggleDropdown}
        className="flex items-center bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Add to Calendar
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              <svg className="w-5 h-5 mr-3 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.6,10.2l-8.2-0.8l-3.4-7.4c-0.2-0.5-0.9-0.5-1.2,0l-3.4,7.4l-8.2,0.8c-0.5,0.1-0.7,0.7-0.3,1.1l6.3,5.3 l-1.9,8.1c-0.1,0.5,0.4,0.9,0.9,0.6l7.1-4.1l7.1,4.1c0.4,0.2,1-0.1,0.9-0.6l-1.9-8.1l6.3-5.3C22.3,10.9,22.1,10.3,21.6,10.2z" />
              </svg>
              Google Calendar
            </a>
            <a
              href={outlookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              <svg className="w-5 h-5 mr-3 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,4H5C3.9,4,3,4.9,3,6v12c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V6C21,4.9,20.1,4,19,4z M5,8h14v2H5V8z M5,12h14v2H5V12z M5,16h9v2H5V16z" />
              </svg>
              Outlook Calendar
            </a>
            <a
              href={iCalUrl}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
              download={`${event.title.replace(/\s+/g, '-')}.ics`}
            >
              <svg className="w-5 h-5 mr-3 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download .ics File
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions for date formatting
function formatGoogleDate(date) {
  return date.toISOString().replace(/-|:|\.\d+/g, '');
}

function formatOutlookDate(date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0];
}
