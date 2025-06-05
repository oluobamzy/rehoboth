'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useEvent, useEventRegistrations } from '@/hooks/useEvents';
import useEventCapacity from '@/hooks/useEventCapacity';
import Image from 'next/image';
import { formatDate, formatTime } from '@/utils/dateUtils';
import RegistrationForm from './RegistrationForm';
import RegistrationSuccess from './RegistrationSuccess';
import GoogleMap from './GoogleMap';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import AddToCalendarButton from './AddToCalendarButton';
import RealTimeCapacityIndicator from './RealTimeCapacityIndicator';

export default function EventDetail() {
  const { id } = useParams();
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(null);
  
  // Fetch event details
  const { 
    data, 
    error, 
    isLoading, 
    isError 
  } = useEvent(id);
  
  const event = data?.event;
  
  // Determine if registration is available
  const registrationAvailable = event?.registration_required && 
    (!event.registration_deadline || new Date(event.registration_deadline) > new Date());
  
  // Format date and time for display
  const formattedDate = event ? formatDate(event.start_datetime) : '';
  const startTime = event ? formatTime(event.start_datetime) : '';
  const endTime = event ? formatTime(event.end_datetime) : '';
  
  // Handle registration button click
  const handleRegisterClick = () => {
    setShowRegistrationForm(true);
  };
  
  // Handle registration form cancel
  const handleCancelRegistration = () => {
    setShowRegistrationForm(false);
  };
  
  // Handle registration success
  const handleRegistrationSuccess = (data: any) => {
    setShowRegistrationForm(false);
    setRegistrationSuccess(data);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message={error?.message || 'Failed to load event'} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message="Event not found" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Event Header */}
      <div className="relative mb-6">
        {/* Event image */}
        <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden">
          {event.image_url ? (
            <Image 
              src={event.image_url}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-xl">No Image Available</span>
            </div>
          )}
          
          {/* Featured badge */}
          {event.is_featured && (
            <span className="absolute top-4 right-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm">
              Featured
            </span>
          )}
        </div>
        
        {/* Event type */}
        <div className="mt-4">
          <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
            {event.event_type}
          </span>
          {event.category && (
            <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium ml-2">
              {event.category}
            </span>
          )}
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left column - Event details */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
          
          <div className="mb-6">
            <div className="flex items-center text-gray-700 mb-2">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-lg">{formattedDate}</span>
            </div>
            
            <div className="flex items-center text-gray-700 mb-2">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{startTime} - {endTime}</span>
            </div>
            
            {event.location_name && (
              <div className="flex items-center text-gray-700 mb-2">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{event.location_name}</span>
              </div>
            )}
            
            {event.cost_cents > 0 ? (
              <div className="flex items-center text-gray-700">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>${(event.cost_cents / 100).toFixed(2)}</span>
              </div>
            ) : (
              <div className="flex items-center text-green-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Free Event</span>
              </div>
            )}
          </div>
          
          {/* Calendar button */}
          <div className="mb-6">
            <AddToCalendarButton event={event} />
          </div>
          
          {/* Event description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">About This Event</h2>
            <div className="prose max-w-none">
              <p>{event.description || 'No description provided.'}</p>
            </div>
          </div>
          
          {/* Contact info */}
          {(event.contact_email || event.contact_phone) && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Contact Information</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                {event.contact_email && (
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href={`mailto:${event.contact_email}`} className="text-primary-600 hover:underline">
                      {event.contact_email}
                    </a>
                  </div>
                )}
                {event.contact_phone && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a href={`tel:${event.contact_phone}`} className="text-primary-600 hover:underline">
                      {event.contact_phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Right column - Registration and Map */}
        <div className="md:w-96">
          {/* Registration card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Registration</h2>
            
            {/* Capacity info with real-time updates */}
            {event.max_capacity && (
              <div className="mb-4">
                <p className="text-gray-700 mb-1">
                  Capacity: <span className="font-medium">{event.max_capacity} people</span>
                </p>
                
                <RealTimeCapacityIndicator eventId={event.id} />
              </div>
            )}
            
            {/* Registration status */}
            {event.registration_required ? (
              <div className="mb-4">
                {event.registration_deadline && (
                  <p className="text-gray-700 mb-2">
                    Registration Deadline: <br />
                    <span className="font-medium">
                      {formatDate(event.registration_deadline)} at {formatTime(event.registration_deadline)}
                    </span>
                  </p>
                )}
                
                {registrationAvailable ? (
                  <>
                    {!registrationSuccess && !showRegistrationForm && (
                      <button 
                        onClick={handleRegisterClick}
                        className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 transition-colors"
                      >
                        Register for this Event
                      </button>
                    )}
                    
                    {showRegistrationForm && (
                      <RegistrationForm 
                        eventId={event.id} 
                        onSuccess={handleRegistrationSuccess}
                        onCancel={handleCancelRegistration}
                      />
                    )}
                    
                    {registrationSuccess && (
                      <RegistrationSuccess 
                        data={registrationSuccess} 
                        eventTitle={event.title}
                      />
                    )}
                  </>
                ) : (
                  <div className="text-yellow-700 bg-yellow-50 p-4 rounded-md">
                    <p className="font-medium">Registration is closed</p>
                    {event.registration_deadline && (
                      <p className="text-sm mt-1">
                        The deadline has passed on {formatDate(event.registration_deadline)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-gray-700">No registration required for this event.</p>
              </div>
            )}
          </div>
          
          {/* Map card */}
          {(event.location_address || event.location_coordinates) && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              
              {event.location_address && (
                <p className="text-gray-700 mb-4">{event.location_address}</p>
              )}
              
              {/* Google Map component (simplified) */}
              <div className="h-64 bg-gray-200 rounded-md overflow-hidden">
                {/* In a real implementation, this would be a Google Map */}
                {event.location_coordinates ? (
                  <GoogleMap 
                    location={event.location_coordinates}
                    name={event.location_name}
                    address={event.location_address}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">Map not available</span>
                  </div>
                )}
              </div>
              
              {/* Directions link */}
              {event.location_address && (
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(event.location_address)}`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 text-primary-600 hover:underline flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Get Directions
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
