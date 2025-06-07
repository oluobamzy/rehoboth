'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StripePaymentForm } from '@/components/payments/StripePaymentForm';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';

export default function EventPaymentPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = params.id;
  const registrationId = searchParams.get('registration');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<{
    clientSecret: string;
    amount: number;
    eventTitle: string;
  } | null>(null);

  // Fetch payment intent on page load
  useEffect(() => {
    if (!registrationId) {
      setError('Missing registration information');
      setLoading(false);
      return;
    }

    async function getPaymentIntent() {
      try {
        const response = await fetch(`/api/events/${eventId}/payment-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ registrationId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create payment');
        }

        const data = await response.json();
        setPaymentInfo({
          clientSecret: data.clientSecret,
          amount: data.amount,
          eventTitle: data.eventTitle || 'Event Registration',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize payment');
      } finally {
        setLoading(false);
      }
    }

    getPaymentIntent();
  }, [eventId, registrationId]);

  const handlePaymentSuccess = (paymentIntentId: string) => {
    // Redirect to success page after short delay
    setTimeout(() => {
      router.push(`/events/${eventId}/registration-success?registration=${registrationId}&payment=success`);
    }, 1500);
  };

  const handlePaymentError = (error: Error) => {
    console.error('Payment error:', error);
    setError(error.message);
  };

  const handleBackToEvent = () => {
    router.push(`/events/${eventId}`);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner size="lg" className="mb-4" />
        <p className="text-lg">Preparing your payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Payment Setup Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={handleBackToEvent}>Back to Event</Button>
      </div>
    );
  }

  if (!paymentInfo?.clientSecret) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Payment Setup Error</AlertTitle>
          <AlertDescription>Unable to initialize payment system. Please try again later.</AlertDescription>
        </Alert>
        <Button onClick={handleBackToEvent}>Back to Event</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Complete Your Payment</h1>
        <p className="text-gray-600 mb-1">
          Please provide your payment details to complete your registration.
        </p>
        {paymentInfo?.eventTitle && (
          <p className="text-primary-600 font-medium mt-2">
            {paymentInfo.eventTitle}
          </p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <StripePaymentForm
          clientSecret={paymentInfo.clientSecret}
          eventTitle={paymentInfo.eventTitle}
          amount={paymentInfo.amount}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      </div>

      <div className="mt-6 text-center">
        <Button variant="outline" onClick={handleBackToEvent} className="mr-4">
          Back to Event
        </Button>
      </div>
    </div>
  );
}
