"use client";

import { useState, useEffect } from 'react';
import { getEventCapacity, subscribeToEventRegistrations } from '@/services/eventService';

/**
 * Custom hook for real-time event capacity tracking
 * @param eventId - The ID of the event to track capacity for
 * @returns An object containing capacity information and loading/error states
 */
export function useEventCapacity(eventId: string) {
  const [capacity, setCapacity] = useState<{
    total: number;
    registered: number;
    available: number;
    isWaitlist: boolean;
  }>({
    total: 0,
    registered: 0,
    available: 0,
    isWaitlist: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    let subscription: any;

    const fetchCapacity = async () => {
      try {
        setLoading(true);
        const capacityData = await getEventCapacity(eventId);
        setCapacity(capacityData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch event capacity');
        console.error('Error in useEventCapacity hook:', err);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchCapacity();

    // Set up real-time subscription
    try {
      subscription = subscribeToEventRegistrations(eventId, (payload) => {
        console.log('Registration change detected:', payload);
        
        // When a registration changes, refetch capacity data
        fetchCapacity();
      });
    } catch (err) {
      console.error('Error setting up real-time subscription:', err);
      setError('Failed to set up real-time updates');
    }

    // Cleanup function
    return () => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, [eventId]);

  return {
    capacity,
    loading,
    error,
    isWaitlist: capacity.isWaitlist,
    availableSpots: capacity.available,
    percentFull: capacity.total > 0 ? Math.round((capacity.registered / capacity.total) * 100) : 0,
  };
}

export default useEventCapacity;
