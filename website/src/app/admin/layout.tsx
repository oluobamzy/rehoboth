"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/services/auth';
import Link from 'next/link';
import MainLayout from '@/components/common/MainLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login?returnUrl=' + encodeURIComponent(pathname));
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading, router, pathname]);

  if (loading || authLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <nav className="mb-6">
            <ul className="flex space-x-4 overflow-x-auto pb-2">
              <li>
                <Link
                  href="/admin/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/admin/dashboard'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/sermons"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname?.startsWith('/admin/sermons')
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Sermons
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/events"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname?.startsWith('/admin/events')
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/carousel"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/admin/carousel'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Carousel
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/donations"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname?.startsWith('/admin/donations')
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Donations
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/newsletter"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname?.startsWith('/admin/newsletter')
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Newsletter
                </Link>
              </li>
            </ul>
          </nav>
          {children}
        </div>
      </div>
    </MainLayout>
  );
}
