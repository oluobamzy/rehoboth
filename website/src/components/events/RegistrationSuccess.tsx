'use client';

interface RegistrationSuccessProps {
  data: {
    registrationId: string;
    status: string;
    confirmationCode?: string;
    paymentRequired: boolean;
    eventId?: string;
  };
  eventTitle: string;
}

export default function RegistrationSuccess({ data, eventTitle }: RegistrationSuccessProps) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-md p-4">
      <div className="flex items-start mb-3">
        <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-medium text-green-800">Registration Successful!</h3>
      </div>
      
      <p className="text-green-700 mb-4">
        You have successfully registered for <strong>{eventTitle}</strong>.
      </p>
      
      {data.confirmationCode && (
        <div className="mb-3">
          <p className="text-sm text-green-700">Confirmation Code:</p>
          <div className="bg-white px-4 py-2 border border-green-200 rounded text-lg font-mono font-medium text-center">
            {data.confirmationCode}
          </div>
        </div>
      )}
      
      <p className="text-sm text-green-700">
        {data.status === 'waitlist' ? (
          <span className="font-medium">You have been added to the waitlist. We'll notify you if a spot becomes available.</span>
        ) : (
          <span>A confirmation email has been sent with the event details.</span>
        )}
      </p>
      
      {/* Payment prompt if required */}
      {data.paymentRequired && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-3">
          <p className="text-yellow-800 font-medium">Payment Required</p>
          <p className="text-sm text-yellow-700 mt-1">
            Please complete your payment to secure your registration.
          </p>
          <a href={`/events/${data.eventId}/payment?registration=${data.registrationId}`} className="block">
            <button className="mt-2 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 w-full">
              Proceed to Payment
            </button>
          </a>
        </div>
      )}
    </div>
  );
}
