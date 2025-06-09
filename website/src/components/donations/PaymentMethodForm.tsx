'use client';

{/* src/components/donations/PaymentMethodForm.tsx */}
import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
  AddressElement,
} from '@stripe/react-stripe-js';
import { DonationFormData } from '@/types/donations';

interface PaymentMethodFormProps {
  formData: DonationFormData;
  clientSecret?: string;
  onBack: () => void;
  onPaymentComplete?: (success: boolean, message?: string) => void;
  onSetupRecurring?: (paymentMethodId: string) => Promise<void>;
  isProcessing: boolean;
  errorMessage?: string;
}

export default function PaymentMethodForm({
  formData,
  clientSecret,
  onBack,
  onPaymentComplete,
  onSetupRecurring,
  isProcessing,
  errorMessage,
}: PaymentMethodFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [paymentError, setPaymentError] = useState<string | undefined>(errorMessage);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    // Clear any previous errors
    setPaymentError(undefined);
    
    try {
      if (formData.isRecurring && onSetupRecurring) {
        // For recurring donations, create a SetupIntent
        const result = await stripe.createPaymentMethod({
          elements,
          params: {
            billing_details: {
              name: formData.donorName,
              email: formData.donorEmail,
            },
          },
        });
        
        if (result.error) {
          throw new Error(result.error.message || 'Failed to setup payment method');
        }
        
        if (result.paymentMethod) {
          // Set up recurring donation with the payment method ID
          await onSetupRecurring(result.paymentMethod.id);
        }
      } else if (clientSecret && onPaymentComplete) {
        // For one-time donations, confirm the PaymentIntent
        const result = await stripe.confirmPayment({
          elements,
          clientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/donate/confirmation`,
            payment_method_data: {
              billing_details: {
                name: formData.donorName,
                email: formData.donorEmail,
              },
            },
          },
          redirect: 'if_required',
        });
        
        if (result.error) {
          throw new Error(result.error.message || 'Payment failed');
        } else {
          // Payment succeeded
          onPaymentComplete(true);
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error instanceof Error ? error.message : 'Payment processing failed');
      
      if (onPaymentComplete) {
        onPaymentComplete(false, error instanceof Error ? error.message : undefined);
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Payment Details
        </h2>
        
        <div className="mb-6">
          <div className="p-4 bg-gray-50 rounded-lg mb-4">
            <h3 className="font-medium text-gray-700 mb-2">Donation Summary</h3>
            <p className="text-gray-600">
              {formData.isRecurring ? 'Recurring' : 'One-time'} donation of{' '}
              <span className="font-medium">
                ${formData.customAmount || formData.amount}
              </span>
              {formData.isRecurring && ` (${formData.frequency})`} to{' '}
              {formData.designationId || 'General Fund'}
            </p>
          </div>
          
          <div className="space-y-4">
            <PaymentElement />
            
            <AddressElement 
              options={{
                mode: 'billing',
                fields: {
                  phone: 'never',
                },
                defaultValues: {
                  name: formData.donorName,
                  address: {
                    country: 'US'
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
      
      {paymentError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{paymentError}</p>
        </div>
      )}
      
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 bg-gray-100 text-gray-800 font-medium rounded hover:bg-gray-200"
          disabled={isProcessing}
        >
          Back
        </button>
        
        <button
          type="submit"
          disabled={!stripe || !elements || isProcessing}
          className={`px-6 py-2 bg-blue-600 text-white font-medium rounded ${
            !stripe || !elements || isProcessing
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-blue-700'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center">
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Processing...</span>
            </div>
          ) : formData.isRecurring ? (
            'Set Up Recurring Donation'
          ) : (
            'Complete Donation'
          )}
        </button>
      </div>
      
      <div className="pt-4 text-center">
        <p className="text-sm text-gray-600">
          Your payment is secure and encrypted. We use Stripe for secure payment processing.
        </p>
      </div>
    </form>
  );
}
