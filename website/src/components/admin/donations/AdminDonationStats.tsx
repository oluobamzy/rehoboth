// src/components/admin/donations/AdminDonationStats.tsx
'use client';

import { useState, useEffect } from 'react';
import { DonationStatistics } from '@/types/donations';
import { FiCalendar, FiDollarSign, FiUsers, FiRepeat, FiPieChart } from 'react-icons/fi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function AdminDonationStats() {
  const [statistics, setStatistics] = useState<DonationStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    async function fetchStatistics() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (dateRange.startDate) queryParams.append('startDate', dateRange.startDate);
        if (dateRange.endDate) queryParams.append('endDate', dateRange.endDate);
        
        const response = await fetch(`/api/admin/donations/statistics?${queryParams.toString()}`);
        
        if (response.ok) {
          const data = await response.json();
          setStatistics(data);
        } else {
          console.error('Failed to fetch donation statistics:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching donation statistics:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStatistics();
  }, [dateRange.startDate, dateRange.endDate]);

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  // Prepare chart data
  const getDesignationChartData = () => {
    if (!statistics) return null;
    
    const labels = statistics.designationTotals.map(d => d.name);
    const data = statistics.designationTotals.map(d => d.amount / 100); // Convert from cents
    
    return {
      labels,
      datasets: [
        {
          label: 'Donation Amounts',
          data,
          backgroundColor: [
            'rgba(54, 162, 235, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(255, 205, 86, 0.5)',
            'rgba(255, 99, 132, 0.5)',
            'rgba(153, 102, 255, 0.5)',
          ],
          borderColor: [
            'rgb(54, 162, 235)',
            'rgb(75, 192, 192)',
            'rgb(255, 205, 86)',
            'rgb(255, 99, 132)',
            'rgb(153, 102, 255)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const getMonthlyTrendsChartData = () => {
    if (!statistics) return null;
    
    const labels = statistics.monthlyTotals.map(m => m.month);
    const data = statistics.monthlyTotals.map(m => m.total / 100); // Convert from cents
    
    return {
      labels,
      datasets: [
        {
          label: 'Monthly Donations',
          data,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.1,
          fill: true,
        },
      ],
    };
  };

  return (
    <div className="space-y-6">
      {/* Date Range Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Date Range</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="startDate" className="text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="space-y-1">
            <label htmlFor="endDate" className="text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : statistics ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <FiDollarSign className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Donations</p>
                <p className="text-xl font-semibold">{formatCurrency(statistics.totalAmount)}</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <FiUsers className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Donations</p>
                <p className="text-xl font-semibold">{statistics.donationCount}</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow flex items-center">
              <div className="rounded-full bg-yellow-100 p-3 mr-4">
                <FiRepeat className="text-yellow-600 text-xl" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Recurring Donors</p>
                <p className="text-xl font-semibold">{statistics.recurringDonorCount}</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow flex items-center">
              <div className="rounded-full bg-purple-100 p-3 mr-4">
                <FiDollarSign className="text-purple-600 text-xl" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Average Donation</p>
                <p className="text-xl font-semibold">{formatCurrency(statistics.averageAmount)}</p>
              </div>
            </div>
          </div>
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Designation Distribution */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Donation by Designation</h3>
              <div className="h-64">
                {getDesignationChartData() && (
                  <Pie 
                    data={getDesignationChartData()!} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                    }} 
                  />
                )}
              </div>
            </div>
            
            {/* Monthly Trends */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Donation Trends</h3>
              <div className="h-64">
                {getMonthlyTrendsChartData() && (
                  <Line 
                    data={getMonthlyTrendsChartData()!} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return '$' + value;
                            }
                          }
                        }
                      },
                    }} 
                  />
                )}
              </div>
            </div>
          </div>
          
          {/* Designation Progress */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Fundraising Progress</h3>
            <div className="space-y-4">
              {statistics.designationTotals
                .filter(d => d.target && d.target > 0) // Only show designations with targets
                .map((designation, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{designation.name}</span>
                      <span className="text-sm text-gray-500">
                        {formatCurrency(designation.amount)} / {formatCurrency(designation.target || 0)}
                        {' '}({designation.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${Math.min(100, designation.percentage || 0)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              
              {statistics.designationTotals.filter(d => d.target && d.target > 0).length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  No active fundraising campaigns with targets.
                </p>
              )}
            </div>
          </div>
          
          {/* Recent Donations */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Donations</h3>
            <div className="overflow-x-auto">
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {statistics.recentDonations.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-sm text-gray-500 text-center">
                        No recent donations
                      </td>
                    </tr>
                  ) : (
                    statistics.recentDonations.map((donation) => (
                      <tr key={donation.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(donation.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(donation.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {donation.designation || 'General Fund'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
          Unable to load donation statistics. Please try again later.
        </div>
      )}
    </div>
  );
}
