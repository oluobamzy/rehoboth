{/* src/app/donate/page.tsx */}
import DonationForm from '@/components/donations/DonationForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Donate | Rehoboth Church',
  description: 'Support the mission of Rehoboth Church through your generous donations.',
};

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Support Our Ministry
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Your generous donations help us continue our mission, support our community,
            and spread the message of hope. Thank you for partnering with us.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto bg-white shadow overflow-hidden rounded-lg">
          <DonationForm />
        </div>
      </div>
    </div>
  );
}
