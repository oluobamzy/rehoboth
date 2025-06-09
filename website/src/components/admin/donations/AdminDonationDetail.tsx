// src/components/admin/donations/AdminDonationDetail.tsx
'use client';

import { useState, useEffect } from 'react';
import { Donation } from '@/types/donations';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiMail, FiUser, FiCalendar, FiDollarSign, FiTag, FiCreditCard } from 'react-icons/fi';
import Link from 'next/link';

interface AdminDonationDetailProps {
  donationId: string;
}

export default function AdminDonationDetail({ donationId }: AdminDonationDetailProps) {
  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchDonationDetails() {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/donations/${donationId}`);
        if (response.ok) {
          const data = await response.json();
          setDonation(data);
        } else {
          setError('Failed to fetch donation details');
        }
      } catch (err) {
        setError('An error occurred while fetching donation details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (donationId) {
      fetchDonationDetails();
    }
  }, [donationId]);

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Donation Detail</h2>
          <Link href="/admin/donations" className="flex items-center text-blue-600 hover:text-blue-800">
            <FiArrowLeft className="mr-1" /> Back to donations
          </Link>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error || 'Donation not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Donation Details</h2>
        <Link href="/admin/donations" className="flex items-center text-blue-600 hover:text-blue-800">
          <FiArrowLeft className="mr-1" /> Back to donations
        </Link>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="text-2xl font-bold text-blue-700 mb-2 flex items-center">
                <FiDollarSign className="mr-2" />
                {formatCurrency(donation.amount, donation.currency)}
              </div>
              <div className="text-sm text-blue-700">
                {donation.is_recurring ? `Recurring (${donation.frequency})` : 'One-time donation'}
              </div>
            </div>
            
            {donation.donor_name && (
              <div className="border-b pb-4">
                <div className="flex items-center mb-2">
                  <FiUser className="text-gray-500 mr-2" />
                  <h3 className="text-sm font-medium text-gray-500">Donor Information</h3>
                </div>
                <p className="text-base font-medium">{donation.donor_name}</p>
                {donation.donor_email && (
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <FiMail className="mr-1" />
                    <a href={`mailto:${donation.donor_email}`} className="text-blue-600 hover:underline">
                      {donation.donor_email}
                    </a>
                  </p>
                )}
              </div>
            )}
            
            <div className="border-b pb-4">
              <div className="flex items-center mb-2">
                <FiCalendar className="text-gray-500 mr-2" />
                <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
              </div>
              <p className="text-base">{formatDate(donation.created_at)}</p>
            </div>
            
            <div className="border-b pb-4">
              <div className="flex items-center mb-2">
                <FiTag className="text-gray-500 mr-2" />
                <h3 className="text-sm font-medium text-gray-500">Designation</h3>
              </div>
              <p className="text-base">{donation.fund_designation || 'General Fund'}</p>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <div className="flex items-center mb-2">
                <FiCreditCard className="text-gray-500 mr-2" />
                <h3 className="text-sm font-medium text-gray-500">Payment Information</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Transaction ID:</span> {donation.stripe_payment_id || 'N/A'}
                </p>
                {donation.is_recurring && donation.stripe_subscription_id && (
                  <p className="text-sm">
                    <span className="font-medium">Subscription ID:</span> {donation.stripe_subscription_id}
                  </p>
                )}
              </div>
            </div>
            
            {donation.metadata && Object.keys(donation.metadata).length > 0 && (
              <div className="border-b pb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Additional Information</h3>
                <div className="space-y-2">
                  {Object.entries(donation.metadata).map(([key, value]) => (
                    <p className="text-sm" key={key}>
                      <span className="font-medium">{key}:</span> {String(value)}
                    </p>
                  ))}
                </div>
              </div>
            )}
            
            <div className="border-b pb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={async () => {
                    try {
                      // Request to resend the donation receipt
                      const response = await fetch(`/api/admin/donations/${donationId}/resend-receipt`, {
                        method: 'POST',
                      });
                      
                      if (response.ok) {
                        alert('Receipt email has been sent successfully');
                      } else {
                        alert('Failed to send receipt email');
                      }
                    } catch (err) {
                      alert('An error occurred while sending the receipt');
                      console.error(err);
                    }
                  }}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                >
                  Resend Receipt Email
                </button>
                {donation.is_recurring && (
                  <Link
                    href={`/admin/donations/recurring/${donation.stripe_subscription_id}`}
                    className="block px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                  >
                    View Recurring Subscription
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
