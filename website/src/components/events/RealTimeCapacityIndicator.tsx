'use client';

import { useEffect, useState } from 'react';
import useEventCapacity from '@/hooks/useEventCapacity';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface RealTimeCapacityIndicatorProps {
  eventId: string;
}

export default function RealTimeCapacityIndicator({ eventId }: RealTimeCapacityIndicatorProps) {
  const {
    capacity,
    loading,
    error,
    percentFull,
    isWaitlist,
    availableSpots
  } = useEventCapacity(eventId);

  if (loading) {
    return <div className="flex items-center space-x-2 text-sm text-gray-500">
      <LoadingSpinner size="sm" />
      <span>Loading capacity...</span>
    </div>;
  }

  if (error) {
    return <p className="text-sm text-red-500">Unable to load capacity information</p>;
  }

  // If no capacity set
  if (capacity.total === 0) {
    return <p className="text-sm text-gray-500">Unlimited capacity</p>;
  }

  // Display capacity information
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">
          {capacity.registered} / {capacity.total} spots filled
        </span>
        <span className={`font-medium ${isWaitlist ? 'text-red-600' : 'text-green-600'}`}>
          {isWaitlist ? 'Waitlist Only' : `${availableSpots} spot${availableSpots !== 1 ? 's' : ''} left`}
        </span>
      </div>

      {/* Capacity progress bar */}
      <div className="relative h-2 bg-gray-200 rounded overflow-hidden">
        <div 
          className={`absolute h-full ${isWaitlist ? 'bg-red-500' : 'bg-primary-600'}`}
          style={{ width: `${Math.min(percentFull, 100)}%` }} 
        />
      </div>
      
      {isWaitlist && (
        <p className="text-xs text-red-600 mt-1">
          Event is full. You'll be added to the waitlist.
        </p>
      )}
    </div>
  );
}
