'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { CheckCircleIcon, CalendarIcon } from '@heroicons/react/24/outline';

export default function RegistrationSuccessPage({
  params
}: {
  params: { id: string }
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = params.id;
  const registrationId = searchParams.get('registration');
  const paymentStatus = searchParams.get('payment');
  
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [registrationDetails, setRegistrationDetails] = useState<{
    paymentStatus: string;
    paymentRequired: boolean;
  } | null>(null);

  useEffect(() => {
    // Fetch event details and registration status
    async function fetchData() {
      try {
        // Fetch event details
        const eventResponse = await fetch(`/api/events/${eventId}`);
        
        if (!eventResponse.ok) {
          throw new Error('Failed to load event details');
        }
        
        const eventData = await eventResponse.json();
        setEvent(eventData.event);
        
        // If registration ID exists, fetch registration status
        if (registrationId) {
          const regResponse = await fetch(
            `/api/events/${eventId}/registration-status?registration=${registrationId}`
          );
          
          if (regResponse.ok) {
            const regData = await regResponse.json();
            
            // If this is showing as payment success due to URL param but DB says otherwise,
            // update the payment status in the UI
            if (paymentStatus === 'success' && regData.paymentStatus !== 'paid') {
              console.warn('URL shows payment success but DB status differs');
            }
            
            setRegistrationDetails({
              paymentStatus: regData.paymentStatus,
              paymentRequired: regData.paymentRequired
            });
          }
        }
      } catch (err) {
        setError('Could not load event details. Please check your registration confirmation email.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [eventId, registrationId, paymentStatus]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner size="lg" className="mb-4" />
        <p className="text-lg">Loading registration details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircleIcon className="h-16 w-16 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Registration Successful!</h1>
        
        <p className="text-xl text-gray-700 mb-6">
          Thank you for registering{paymentStatus === 'success' ? ' and completing your payment' : ''}!
        </p>
        
        {paymentStatus === 'success' && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertTitle className="text-green-700">Payment Successful</AlertTitle>
            <AlertDescription className="text-green-700">
              Your payment has been processed successfully. Your spot is now fully reserved.
            </AlertDescription>
          </Alert>
        )}
        
        {error ? (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : event ? (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{event.title}</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-6">
              <div className="flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-gray-600" />
                <span>{formatDate(event.start_datetime)}</span>
              </div>
              <div className="flex items-center justify-center">
                <ClockIcon className="h-5 w-5 mr-2 text-gray-600" />
                <span>{formatTime(event.start_datetime)} - {formatTime(event.end_datetime)}</span>
              </div>
            </div>
            {event.location_name && (
              <p className="text-gray-700 mb-2">
                <MapPinIcon className="h-5 w-5 inline mr-1 text-gray-600" />
                <span>{event.location_name}</span>
              </p>
            )}
          </div>
        ) : null}

        <div className="mt-8 mb-4">
          <p className="text-gray-600">
            We've sent a confirmation email with all the details.
            {event?.cost_cents > 0 && !paymentStatus && (
              <span className="block mt-2 font-medium text-amber-600">
                Please complete your payment to confirm your spot.
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          {/* Show payment button only if payment is required and not yet paid */}
          {((registrationDetails?.paymentRequired && 
             registrationDetails?.paymentStatus !== 'paid') || 
            (event?.cost_cents > 0 && !paymentStatus)) && (
            <Button 
              onClick={() => router.push(`/events/${eventId}/payment?registration=${registrationId}`)}
              className="bg-primary text-white"
            >
              Complete Payment
            </Button>
          )}
          
          <Button 
            variant="outline"
            onClick={() => router.push(`/events/${eventId}`)}
          >
            Back to Event
          </Button>
          
          <Button
            variant="outline"
            onClick={() => router.push('/events')}
          >
            View All Events
          </Button>
        </div>
      </div>
    </div>
  );
}

function ClockIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
}

function MapPinIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
      />
    </svg>
  );
}
