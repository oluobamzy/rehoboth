'use client';

import { FaFacebook, FaInstagram, FaYoutube, FaTwitter } from 'react-icons/fa';
import Link from 'next/link';

export default function SocialMediaIcons() {
  const socialLinks = [
    {
      name: 'Facebook',
      icon: <FaFacebook size={24} />,
      url: 'https://facebook.com/rehobothcchurch',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      name: 'Instagram',
      icon: <FaInstagram size={24} />,
      url: 'https://instagram.com/rehobothcchurch',
      color: 'bg-pink-600 hover:bg-pink-700',
    },
    {
      name: 'YouTube',
      icon: <FaYoutube size={24} />,
      url: 'https://youtube.com/rehobothcchurch',
      color: 'bg-red-600 hover:bg-red-700',
    },
    {
      name: 'Twitter',
      icon: <FaTwitter size={24} />,
      url: 'https://twitter.com/rehobothcchurch',
      color: 'bg-sky-500 hover:bg-sky-600',
    },
  ];

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
