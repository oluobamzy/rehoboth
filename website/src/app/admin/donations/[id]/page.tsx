// src/app/admin/donations/[id]/page.tsx
import { Metadata } from 'next';
import AdminDonationDetail from '@/components/admin/donations/AdminDonationDetail';

export const metadata: Metadata = {
  title: 'Donation Details | Admin | Rehoboth Church',
  description: 'Manage and review donation details for Rehoboth Church.',
};

interface AdminDonationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminDonationDetailPage({ params }: AdminDonationDetailPageProps) {
  const { id } = await params;
  
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <AdminDonationDetail donationId={id} />
    </div>
  );
}
