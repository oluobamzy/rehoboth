// src/app/admin/donations/recurring/page.tsx
import { Metadata } from 'next';
import AdminRecurringDonations from '@/components/admin/donations/AdminRecurringDonations';

export const metadata: Metadata = {
  title: 'Recurring Donations | Admin | Rehoboth Church',
  description: 'Manage recurring donations for Rehoboth Church.',
};

export default function AdminRecurringDonationsPage() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Recurring Donations</h1>
      </div>
      
      <AdminRecurringDonations />
    </div>
  );
}
