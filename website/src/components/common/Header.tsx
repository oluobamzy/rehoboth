// src/components/common/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  
  // Contact info for top bar
  const phoneNumber = "613-400-4966";
  const emailAddress = "rehobothchrisitianchurch2022@gmail.com";

  const navItems = [
    { 
      name: 'About Us', 
      href: '/about',
      hasDropdown: true,
      dropdownItems: [
        { name: 'Vision', href: '/about?tab=vision' },
        { name: 'Mission', href: '/about?tab=mission' },
        { name: 'Our Leadership', href: '/about/leadership' },
      ]
    },
    { 
      name: 'Ministries', 
      href: '/ministries',
      hasDropdown: true,
      dropdownItems: [
        { name: 'Women\'s Ministry', href: '/ministries/women' },
        { name: 'Children\'s Ministry', href: '/ministries/children' },
        { name: 'Youth Ministry', href: '/ministries/youth' },
        { name: 'Evangelization Ministry', href: '/ministries/evangelization' },
        { name: 'Leadership Ministry', href: '/ministries/leadership' },
        { name: 'Intercession Ministry', href: '/ministries/intercession' },
        { name: 'Community Support Ministry', href: '/ministries/community-support' },
        { name: 'Music Ministry', href: '/ministries/music' },
      ]
    },
    { 
      name: 'Get Involved', 
      href: '/get-involved',
      hasDropdown: true,
      dropdownItems: [
        { name: 'Apply for Volunteering', href: '/get-involved/volunteering' },
        { name: 'Church Membership', href: '/get-involved/membership' },
        { name: 'Prayer Request', href: '/get-involved/prayer-request' },
      ]
    },
    { name: 'Event', href: '/events' },
    { 
      name: 'Media', 
      href: '/media',
      hasDropdown: true,
      dropdownItems: [
        { name: 'Live Stream', href: '/media/live-stream' },
        { name: 'Gallery', href: '/media/gallery' },
        { name: 'Sermons', href: '/sermons' },
      ]
    },
    { name: 'Donate', href: '/donate' },
    { name: 'Contact Us', href: '/contact' },
  ];
  
  // Close dropdown when clicking outside or pressing escape
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
    };
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveDropdown(null);
        setIsMenuOpen(false);
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
    return pathname === path;
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar with contact info and social links */}
      <div className="bg-gray-900 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex space-x-6">
              <a href={`tel:${phoneNumber.replace(/[^0-9+]/g, '')}`} className="flex items-center hover:text-emerald-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {phoneNumber}
              </a>
              <a href={`mailto:${emailAddress}`} className="flex items-center hover:text-emerald-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {emailAddress}
              </a>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-emerald-400">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="hover:text-emerald-400">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main navigation */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <Image 
                  src="/rehoboth_logo_plain.png" 
                  alt="Rehoboth Christian Church Logo" 
                  width={50} 
                  height={50}
                  className="mr-3"
                />
                <span className="text-2xl font-bold text-gray-800">Rehoboth <span className="text-emerald-500">Church</span></span>
              </Link>
            </div>

            {/* Desktop navigation */}
            <nav className="hidden md:block">
              <ul className="flex space-x-6">
                {navItems.map((item) => (
                  <li key={item.name} className="relative group">
                    {item.hasDropdown ? (
                      <div
                        onMouseEnter={() => setActiveDropdown(item.name)}
                        onMouseLeave={() => setActiveDropdown(null)}
                      >
                        <button
                          className={`px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1 ${
                            pathname.startsWith(item.href) || item.dropdownItems?.some(dropItem => pathname === dropItem.href)
                              ? 'text-blue-600'
                              : 'text-gray-700 hover:text-blue-600'
                          }`}
                        >
                          {item.name}
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            className={`transition-transform duration-200 ${
                              activeDropdown === item.name ? 'rotate-180' : ''
                            }`}
                          >
                            <path d="m6 9 6 6 6-6"/>
                          </svg>
                        </button>
                        
                        {/* Dropdown menu */}
                        <div className={`absolute top-full left-0 z-50 mt-1 w-56 origin-top-left rounded-md bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 transition-all duration-200 ${
                          activeDropdown === item.name ? 'opacity-100 visible transform scale-100' : 'opacity-0 invisible transform scale-95'
                        }`}>
                          {item.dropdownItems?.map((dropItem) => (
                            <Link
                              key={dropItem.name}
                              href={dropItem.href}
                              className={`block px-4 py-2 text-sm transition-colors ${
                                pathname === dropItem.href 
                                  ? 'bg-blue-50 text-blue-600 font-medium' 
                                  : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                              }`}
                              onClick={() => setActiveDropdown(null)}
                            >
                              {dropItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className={`px-3 py-2 text-sm font-medium transition-colors ${
                          isActive(item.href)
                            ? 'text-blue-600'
                            : 'text-gray-700 hover:text-blue-600'
                        }`}
                      >
                        {item.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-blue-600 hover:bg-gray-100 focus:outline-none"
                aria-controls="mobile-menu"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu, show/hide based on menu state */}
        {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <div key={item.name}>
                {item.hasDropdown ? (
                  <>
                    <button
                      className={`w-full text-left px-3 py-2 rounded-md text-base font-medium flex items-center justify-between ${
                        pathname.startsWith(item.href) || item.dropdownItems?.some(dropItem => pathname === dropItem.href)
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setActiveDropdown(activeDropdown === item.name ? null : item.name)}
                    >
                      {item.name}
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        className={`transition-transform duration-200 ${
                          activeDropdown === item.name ? 'rotate-180' : ''
                        }`}
                      >
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </button>
                    
                    {/* Mobile dropdown items */}
                    {activeDropdown === item.name && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.dropdownItems?.map((dropItem) => (
                          <Link
                            key={dropItem.name}
                            href={dropItem.href}
                            className={`block px-3 py-2 rounded-md text-sm ${
                              pathname === dropItem.href
                                ? 'bg-blue-100 text-blue-600 font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                            }`}
                            onClick={() => {
                              setIsMenuOpen(false);
                              setActiveDropdown(null);
                            }}
                          >
                            {dropItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
        )}
      </div>
    </header>
  );
}
