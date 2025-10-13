// src/components/admin/AdminHeader.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/services/auth';
import Button from '../common/Button';

export default function AdminHeader() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  
  const adminNavItems = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Carousel', href: '/admin/carousel' },
    { name: 'Sermons', href: '/admin/sermons' },
    { name: 'Events', href: '/admin/events' },
    { name: 'Donations', href: '/admin/donations' },
    { name: 'Newsletter', href: '/admin/newsletter' },
    { name: 'Messages', href: '/admin/messages' },
    { name: 'Volunteers', href: '/admin/volunteers' },
    { name: 'Settings', href: '/admin/settings' },
  ];

  // Close dropdown when clicking outside or pressing escape
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
    };
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Admin Title */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center mr-8">
              <Image 
                src="/rehoboth_logo_plain.png" 
                alt="Rehoboth Christian Church Logo" 
                width={40} 
                height={40}
                className="mr-2"
              />
              <span className="text-xl font-bold text-gray-800">
                Rehoboth <span className="text-emerald-500">Admin</span>
              </span>
            </Link>
            
            {/* Admin Navigation */}
            <nav className="hidden md:block">
              <ul className="flex space-x-1">
                {adminNavItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                        isActive(item.href)
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* User Authentication Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600 hidden sm:block">{user.email}</span>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => signOut()}
                  >
                    Sign Out
                  </Button>
                  <Link href="/">
                    <Button variant="ghost" size="sm">
                      Back to Site
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="primary" size="sm">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200">
          <nav className="py-2">
            <div className="flex flex-wrap gap-2">
              {adminNavItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-1 text-sm font-medium transition-colors rounded ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}