"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchSermons } from '@/services/sermonService';
import MainLayout from '@/components/common/MainLayout';

// Define a local Sermon interface; ideally, this should be imported if shared
interface Sermon {
  id: string;
  title: string;
  is_published: boolean;
  is_featured: boolean;
  view_count?: number;
  duration_seconds?: number;
  created_at: string;
  speaker_name?: string; // Added optional speaker_name
  // Add other sermon properties if they are returned by fetchSermons and used here
}

interface AnalyticsDataItem {
  month?: string;
  label?: string;
  count: number;
}

export default function SermonDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [sermonStats, setSermonStats] = useState({
    totalCount: 0,
    publishedCount: 0,
    featuredCount: 0,
    totalViews: 0,
    avgDuration: 0
  });
  const [recentSermons, setRecentSermons] = useState<Sermon[]>([]);
  const [topSermons, setTopSermons] = useState<Sermon[]>([]);
  const [analyticsData, setAnalyticsData] = useState<{
    viewsByMonth: AnalyticsDataItem[];
    engagementByQuarter: AnalyticsDataItem[];
  }>({
    viewsByMonth: [],
    engagementByQuarter: []
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      try {
        // Assuming fetchSermons returns an object with a sermons array of type Sermon[]
        const { sermons } = await fetchSermons({
          pageSize: 100,
          includeUnpublished: true,
        });
        
        if (sermons) {
          const typedSermons = sermons as Sermon[]; // Cast if fetchSermons doesn't return strongly typed Sermon

          const published = typedSermons.filter((s: Sermon) => s.is_published);
          const featured = typedSermons.filter((s: Sermon) => s.is_featured);
          const totalViews = typedSermons.reduce((sum: number, s: Sermon) => sum + (s.view_count || 0), 0);
          
          const sermonsWithDuration = typedSermons.filter((s: Sermon) => typeof s.duration_seconds === 'number');
          const avgDuration = sermonsWithDuration.length > 0
            ? sermonsWithDuration.reduce((sum: number, s: Sermon) => sum + (s.duration_seconds || 0), 0) / sermonsWithDuration.length
            : 0;
          
          setSermonStats({
            totalCount: typedSermons.length,
            publishedCount: published.length,
            featuredCount: featured.length,
            totalViews,
            avgDuration: Math.round(avgDuration)
          });

          const sortedSermons = [...typedSermons];
          const recent = sortedSermons.sort((a: Sermon, b: Sermon) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ).slice(0, 5);
          
          const top = sortedSermons.sort((a: Sermon, b: Sermon) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 5);
          
          setRecentSermons(recent);
          setTopSermons(top);

          setAnalyticsData({
            viewsByMonth: [
              { month: 'Jan', count: 245 },
              { month: 'Feb', count: 312 },
              { month: 'Mar', count: 287 },
              { month: 'Apr', count: 356 },
              { month: 'May', count: 423 }
            ],
            engagementByQuarter: [
              { label: '25% Complete', count: 623 },
              { label: '50% Complete', count: 482 },
              { label: '75% Complete', count: 295 },
              { label: 'Completed', count: 189 }
            ]
          });
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sermon Insights</h1>
            <p className="text-gray-600 mt-1">
              View analytics and metrics for your sermon content
            </p>
          </div>
          <Link 
            href="/admin/sermons" 
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            Manage Sermons
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-500 text-sm">Total Sermons</p>
                <p className="text-3xl font-bold">{sermonStats.totalCount}</p>
                <div className="text-xs text-gray-500 mt-1">
                  {sermonStats.publishedCount} published, {sermonStats.featuredCount} featured
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-500 text-sm">Total Views</p>
                <p className="text-3xl font-bold">{sermonStats.totalViews.toLocaleString()}</p>
                <div className="text-xs text-gray-500 mt-1">
                  Avg {Math.round(sermonStats.totalViews / Math.max(1, sermonStats.publishedCount))} per sermon
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-500 text-sm">Average Duration</p>
                <p className="text-3xl font-bold">{Math.floor(sermonStats.avgDuration / 60)} min</p>
                <div className="text-xs text-gray-500 mt-1">
                  {formatTime(sermonStats.avgDuration)}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-500 text-sm">Completion Rate</p>
                <p className="text-3xl font-bold">43%</p>
                <div className="text-xs text-gray-500 mt-1">
                  Based on analytics data
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Monthly views chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Views</h2>
                <div className="h-64 flex items-end justify-between">
                  {analyticsData.viewsByMonth.map((item: AnalyticsDataItem, i: number) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="text-xs mb-1">{item.count}</div>
                      <div 
                        className="w-12 bg-blue-500 rounded-t-sm" 
                        style={{ height: `${(item.count / 500) * 100}%`, maxHeight: '90%' }}
                      ></div>
                      <div className="text-xs mt-2">{item.month}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Engagement funnel */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Engagement Funnel</h2>
                <div className="space-y-3">
                  {analyticsData.engagementByQuarter.map((item: AnalyticsDataItem, i: number) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.label}</span>
                        <span>{item.count} viewers</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-orange-600 h-2.5 rounded-full" style={{ 
                          width: `${(item.count / (analyticsData.engagementByQuarter[0]?.count || 1)) * 100}%` 
                        }}></div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Shows how many viewers reached each milestone of sermon completion
                </p>
              </div>
            </div>

            {/* Recent Sermons */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Sermons</h2>
              {recentSermons.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {recentSermons.map((sermon: Sermon) => (
                    <li key={sermon.id}>
                      <Link href={`/admin/sermons/${sermon.id}`} legacyBehavior>
                        <a className="block px-6 py-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{sermon.title}</p>
                              <div className="flex justify-between text-sm text-gray-500">
                                <span>{sermon.speaker_name || 'N/A'}</span> 
                                <span>{formatDate(sermon.created_at)}</span>
                              </div>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              sermon.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {sermon.is_published ? 'Published' : 'Draft'}
                            </span>
                          </div>
                        </a>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No recent sermons.</p>
              )}
            </div>

            {/* Top Sermons */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Sermons</h2>
              {topSermons.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {topSermons.map((sermon: Sermon) => (
                    <li key={sermon.id}>
                       <Link href={`/admin/sermons/${sermon.id}`} legacyBehavior>
                         <a className="block px-6 py-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{sermon.title}</p>
                              <div className="flex justify-between text-sm text-gray-500">
                                <span>{sermon.speaker_name || 'N/A'}</span>
                                <span>{sermon.view_count || 0} views</span>
                              </div>
                            </div>
                            {sermon.is_featured && (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                Featured
                              </span>
                            )}
                          </div>
                        </a>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No top sermons.</p>
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
