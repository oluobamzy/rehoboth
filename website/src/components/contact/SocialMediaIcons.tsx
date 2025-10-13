'use client';

import { FaFacebook, FaInstagram, FaYoutube, FaTwitter } from 'react-icons/fa';
import Link from 'next/link';
import { useChurchSettings } from '@/hooks/useChurchSettings';

export default function SocialMediaIcons() {
  const { settings, isLoading } = useChurchSettings();

  // Show loading state
  if (isLoading || !settings) {
    return (
      <div className="flex space-x-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"
          />
        ))}
      </div>
    );
  }

  const socialLinks = [
    {
      name: 'Facebook',
      icon: <FaFacebook size={24} />,
      url: settings.facebook_url,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      name: 'Instagram',
      icon: <FaInstagram size={24} />,
      url: settings.instagram_url,
      color: 'bg-pink-600 hover:bg-pink-700',
    },
    {
      name: 'YouTube',
      icon: <FaYoutube size={24} />,
      url: settings.youtube_url,
      color: 'bg-red-600 hover:bg-red-700',
    },
    {
      name: 'Twitter',
      icon: <FaTwitter size={24} />,
      url: settings.twitter_url,
      color: 'bg-sky-500 hover:bg-sky-600',
    },
  ].filter(social => social.url && social.url.trim()); // Only show links that have URLs

  return (
    <div className="flex space-x-3">
      {socialLinks.map((social) => (
        <Link 
          href={social.url} 
          key={social.name}
          target="_blank" 
          rel="noopener noreferrer"
          className={`${social.color} text-white p-2 rounded-full transition-all duration-300 flex items-center justify-center`}
          aria-label={`Follow us on ${social.name}`}
        >
          {social.icon}
        </Link>
      ))}
    </div>
  );
}
