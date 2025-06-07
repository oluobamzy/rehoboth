'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// Inner payment form component
const PaymentForm = ({
  onSuccess,
  onError,
  eventTitle,
  amount,
}: {
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: Error) => void;
  eventTitle: string;
  amount: number;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [succeeded, setSucceeded] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || 'An error occurred with your payment');
        setProcessing(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/events/payment-success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setError(error.message || 'An error occurred with your payment');
        onError(new Error(error.message || 'Payment failed'));
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setSucceeded(true);
        onSuccess(paymentIntent.id);
      } else {
        setError('Something went wrong with your payment. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      onError(err instanceof Error ? err : new Error('Payment failed'));
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-lg font-medium">Payment for {eventTitle}</h2>
        <p className="text-gray-500 text-sm">Amount: ${(amount / 100).toFixed(2)}</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Payment Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="bg-white p-4 rounded-md border">
        <PaymentElement />
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || processing || succeeded}
      >
        {processing ? <Spinner className="mr-2" /> : null}
        {processing ? 'Processing...' : 'Pay Now'}
      </Button>

      {succeeded && (
        <Alert className="bg-green-50 border-green-200">
          <AlertTitle>Payment Successful</AlertTitle>
          <AlertDescription>Your payment was processed successfully!</AlertDescription>
        </Alert>
      )}
    </form>
  );
};

// Wrapper component that handles the Stripe Elements context
export function StripePaymentForm({
  clientSecret,
  eventTitle,
  amount,
  onSuccess,
  onError,
}: {
  clientSecret: string;
  eventTitle: string;
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: Error) => void;
}) {
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      labels: 'floating' as const,
    },
  };

  return (
    <div className="max-w-md mx-auto">
      {clientSecret ? (
        <Elements stripe={stripePromise} options={options}>
          <PaymentForm
            onSuccess={onSuccess}
            onError={onError}
            eventTitle={eventTitle}
            amount={amount}
          />
        </Elements>
      ) : (
        <div className="text-center p-8">
          <Spinner className="mx-auto mb-4" />
          <p>Preparing payment form...</p>
        </div>
      )}
    </div>
  );
}
