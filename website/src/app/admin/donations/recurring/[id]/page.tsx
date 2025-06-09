// src/app/admin/donations/recurring/[id]/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export const metadata: Metadata = {
  title: 'Recurring Donation Details | Admin | Rehoboth Church',
  description: 'View and manage recurring donation details for Rehoboth Church.',
};

interface RecurringDonationDetailPageProps {
  params: { id: string };
}

// This page would be client-side but we'll extend it later with the proper component
export default function RecurringDonationDetailPage({ params }: RecurringDonationDetailPageProps) {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link 
          href="/admin/donations/recurring" 
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <FiArrowLeft className="mr-1" /> Back to recurring donations
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Recurring Donation Details</h1>
        <p className="text-gray-500">ID: {params.id}</p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-center text-gray-500 py-6">
          Detailed interface for recurring donation {params.id} will be implemented in a future update.
        </p>
      </div>
    </div>
  );
}
