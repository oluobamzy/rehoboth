'use client';

{/* src/components/donations/DonationForm.tsx */}
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import DonationAmountSelector from './DonationAmountSelector';
import DonationDesignation from './DonationDesignation';
import DonorInfoForm from './DonorInfoForm';
import PaymentMethodForm from './PaymentMethodForm';
import RecurringOptions from './RecurringOptions';
import DonationSummary from './DonationSummary';
import DonationConfirmation from './DonationConfirmation';
import { DonationFormData } from '@/types/donations';

// Initialize Stripe Promise with publishable key
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

// Steps in donation flow
enum DonationStep {
  AMOUNT_SELECTION = 0,
  DONOR_INFO = 1,
  PAYMENT = 2,
  CONFIRMATION = 3,
}

export default function DonationForm() {
  // Form state
  const [step, setStep] = useState<DonationStep>(DonationStep.AMOUNT_SELECTION);
  const [formData, setFormData] = useState<DonationFormData>({
    amount: 50,
    customAmount: '',
    designationId: '',
    isRecurring: false,
    frequency: 'monthly',
    donorName: '',
    donorEmail: '',
    agreeToTerms: false,
  });
  
  // Payment processing state
  const [clientSecret, setClientSecret] = useState<string>('');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'initial' | 'processing' | 'succeeded' | 'error'>('initial');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Handle amount and designation selection
  const handleAmountStep = async (data: Partial<DonationFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    setStep(DonationStep.DONOR_INFO);
  };
  
  // Handle donor information submission
  const handleDonorStep = async (data: Partial<DonationFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    setStep(DonationStep.PAYMENT);
    
    // For one-time donations, create a payment intent
    if (!data.isRecurring) {
      await createPaymentIntent();
    }
  };
  
  // Create a Stripe Payment Intent for one-time donations
  const createPaymentIntent = async () => {
    setPaymentStatus('processing');
    
    try {
      const amount = formData.customAmount 
        ? parseFloat(formData.customAmount) 
        : formData.amount;
        
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          donorEmail: formData.donorEmail,
          donorName: formData.donorName,
          fundDesignation: formData.designationId,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }
      
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
      setPaymentStatus('initial');
    } catch (error) {
      console.error('Error creating payment intent:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Payment setup failed');
      setPaymentStatus('error');
    }
  };
  
  // Handle payment completion
  const handlePaymentComplete = (success: boolean, message?: string) => {
    if (success) {
      setPaymentStatus('succeeded');
      setStep(DonationStep.CONFIRMATION);
    } else {
      setPaymentStatus('error');
      setErrorMessage(message || 'Payment failed');
    }
  };
  
  // Handle recurring donation setup
  const handleRecurringDonationSetup = async (paymentMethodId: string) => {
    setPaymentStatus('processing');
    
    try {
      const amount = formData.customAmount 
        ? parseFloat(formData.customAmount) 
        : formData.amount;
        
      const response = await fetch('/api/donations/recurring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          donorEmail: formData.donorEmail,
          donorName: formData.donorName,
          fundDesignation: formData.designationId,
          frequency: formData.frequency,
          paymentMethodId,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to set up recurring donation');
      }
      
      setPaymentStatus('succeeded');
      setStep(DonationStep.CONFIRMATION);
    } catch (error) {
      console.error('Error setting up recurring donation:', error);
      setPaymentStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Subscription setup failed');
    }
  };
  
  // Reset the form (for example after completion to make another donation)
  const resetForm = () => {
    setFormData({
      amount: 50,
      customAmount: '',
      designationId: '',
      isRecurring: false,
      frequency: 'monthly',
      donorName: '',
      donorEmail: '',
      agreeToTerms: false,
    });
    setStep(DonationStep.AMOUNT_SELECTION);
    setClientSecret('');
    setPaymentIntentId('');
    setPaymentStatus('initial');
    setErrorMessage('');
  };
  
  return (
    <div className="bg-white p-6">
      {/* Progress steps */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex justify-between">
          <button
            type="button"
            onClick={() => step > DonationStep.AMOUNT_SELECTION && 
              setStep(DonationStep.AMOUNT_SELECTION)}
            disabled={step === DonationStep.CONFIRMATION}
            className={`pb-4 px-1 ${
              step >= DonationStep.AMOUNT_SELECTION
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500'
            } ${
              step === DonationStep.CONFIRMATION ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Amount & Purpose
          </button>
          <button
            type="button"
            onClick={() => 
              step > DonationStep.DONOR_INFO && 
              setStep(DonationStep.DONOR_INFO)
            }
            disabled={step < DonationStep.DONOR_INFO || step === DonationStep.CONFIRMATION}
            className={`pb-4 px-1 ${
              step >= DonationStep.DONOR_INFO
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500'
            } ${
              (step < DonationStep.DONOR_INFO || step === DonationStep.CONFIRMATION) 
                ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Your Information
          </button>
          <button
            type="button"
            disabled={step < DonationStep.PAYMENT || step === DonationStep.CONFIRMATION}
            className={`pb-4 px-1 ${
              step >= DonationStep.PAYMENT
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500'
            } ${
              (step < DonationStep.PAYMENT || step === DonationStep.CONFIRMATION) 
                ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Payment
          </button>
          <button
            type="button"
            disabled={step < DonationStep.CONFIRMATION}
            className={`pb-4 px-1 ${
              step >= DonationStep.CONFIRMATION
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500'
            } ${
              step < DonationStep.CONFIRMATION ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Confirmation
          </button>
        </nav>
      </div>

      {/* Step content */}
      <div className="py-4">
        {step === DonationStep.AMOUNT_SELECTION && (
          <div className="space-y-8">
            <DonationAmountSelector
              selectedAmount={formData.amount}
              customAmount={formData.customAmount || ''}
              updateFormData={(data) => setFormData(prev => ({ ...prev, ...data }))}
            />
            <DonationDesignation
              selectedDesignation={formData.designationId || ''}
              updateFormData={(data) => setFormData(prev => ({ ...prev, ...data }))}
            />
            <RecurringOptions
              isRecurring={formData.isRecurring}
              frequency={formData.frequency || 'monthly'}
              updateFormData={(data) => setFormData(prev => ({ ...prev, ...data }))}
            />
            <DonationSummary formData={formData} />
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => handleAmountStep(formData)}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === DonationStep.DONOR_INFO && (
          <DonorInfoForm
            donorName={formData.donorName}
            donorEmail={formData.donorEmail}
            agreeToTerms={formData.agreeToTerms}
            onBack={() => setStep(DonationStep.AMOUNT_SELECTION)}
            onNext={handleDonorStep}
          />
        )}

        {step === DonationStep.PAYMENT && (
          <div>
            {formData.isRecurring ? (
              <Elements stripe={stripePromise}>
                <PaymentMethodForm
                  formData={formData}
                  onBack={() => setStep(DonationStep.DONOR_INFO)}
                  onSetupRecurring={handleRecurringDonationSetup}
                  isProcessing={paymentStatus === 'processing'}
                  errorMessage={errorMessage}
                />
              </Elements>
            ) : clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentMethodForm
                  formData={formData}
                  clientSecret={clientSecret}
                  onBack={() => setStep(DonationStep.DONOR_INFO)}
                  onPaymentComplete={handlePaymentComplete}
                  isProcessing={paymentStatus === 'processing'}
                  errorMessage={errorMessage}
                />
              </Elements>
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="ml-3 text-gray-700">Setting up payment...</p>
              </div>
            )}
          </div>
        )}

        {step === DonationStep.CONFIRMATION && (
          <DonationConfirmation
            formData={formData}
            resetForm={resetForm}
          />
        )}
      </div>
    </div>
  );
}
