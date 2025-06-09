// src/app/account/donations/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { RecurringDonation, Donation } from '@/types/donations';
import { useUser } from '@/components/providers/UserProvider';
import { FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

export default function MyDonationsPage() {
  const { user } = useUser();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [recurringDonations, setRecurringDonations] = useState<RecurringDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserDonations() {
      if (!user || !user.email) {
        setLoading(false);
        return;
      }

      try {
        // Fetch one-time donations
        const donationsRes = await fetch(`/api/donations?donorEmail=${encodeURIComponent(user.email)}`);
        
        // Fetch recurring donations
        const recurringRes = await fetch(`/api/donations/recurring?donorEmail=${encodeURIComponent(user.email)}`);
        
        if (donationsRes.ok && recurringRes.ok) {
          const donationsData = await donationsRes.json();
          const recurringData = await recurringRes.json();
          
          setDonations(donationsData.donations || []);
          setRecurringDonations(recurringData.subscriptions || []);
        } else {
          setError('Failed to load your donation information. Please try again later.');
        }
      } catch (err) {
        console.error('Error fetching donation data:', err);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchUserDonations();
  }, [user]);

  // Format currency
  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount / 100);
  };

  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to cancel this recurring donation?')) {
      return;
    }

    try {
      const response = await fetch(`/api/donations/recurring/${subscriptionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Update the UI
        setRecurringDonations(prev => 
          prev.map(sub => 
            sub.stripe_subscription_id === subscriptionId ? { ...sub, status: 'canceled' } : sub
          )
        );
        alert('Your recurring donation has been canceled.');
      } else {
        alert('Failed to cancel the recurring donation. Please try again later.');
      }
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      alert('An error occurred. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Donations</h1>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Donations</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <div className="flex">
            <FiAlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Donations</h1>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
          <div className="flex">
            <FiAlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            <span>Please sign in to view your donation history.</span>
          </div>
        </div>
      </div>
    );
  }

  const hasNoDonations = donations.length === 0 && recurringDonations.length === 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Donations</h1>
      
      {hasNoDonations ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
          <p className="text-gray-500 mb-4">You haven't made any donations yet.</p>
          <a href="/donate" className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Make a Donation
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Recurring Donations Section */}
          {recurringDonations.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Recurring Donations</h2>
              <div className="overflow-x-auto bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Started
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Frequency
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Designation
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Next Payment
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recurringDonations.map((subscription) => (
                      <tr key={subscription.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(subscription.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(subscription.amount, subscription.currency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subscription.frequency.charAt(0).toUpperCase() + subscription.frequency.slice(1)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subscription.fund_designation || 'General Fund'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subscription.status === 'active' ? formatDate(subscription.next_payment_date) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            subscription.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : subscription.status === 'paused'
                              ? 'bg-yellow-100 text-yellow-800'
                              : subscription.status === 'canceled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1).replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subscription.status === 'active' && (
                            <button
                              onClick={() => handleCancelSubscription(subscription.stripe_subscription_id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* One-time Donations Section */}
          {donations.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Donation History</h2>
              <div className="overflow-x-auto bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Designation
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {donations.filter(d => !d.is_recurring).map((donation) => (
                      <tr key={donation.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(donation.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(donation.amount, donation.currency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {donation.fund_designation || 'General Fund'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {donation.stripe_subscription_id ? 'Recurring' : 'One-time'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                <p>
                  Need a tax receipt? Contact us at <a href="mailto:finance@rehobothchurch.org" className="text-blue-600 hover:underline">finance@rehobothchurch.org</a>
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
