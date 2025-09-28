// src/app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Error */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-blue-600">404</h1>
          <div className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
            Page Not Found
          </div>
          <p className="text-gray-600 mb-8">
            Sorry, the page you are looking for does not exist or has been moved.
          </p>
        </div>

        {/* Church Logo/Icon */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">⛪</span>
          </div>
          <p className="text-gray-500 text-sm">
            Rehoboth Christian Church
          </p>
        </div>

        {/* Navigation Links */}
        <div className="space-y-4">
          <Link 
            href="/" 
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Go to Home Page
          </Link>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <Link 
              href="/about" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              About Us
            </Link>
            <Link 
              href="/ministries" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Ministries
            </Link>
            <Link 
              href="/contact" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-12 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">
            Need help finding something?
          </p>
          <p className="text-sm text-gray-500">
            Contact us at{' '}
            <a 
              href="mailto:rehobothchrisitianchurch2022@gmail.com" 
              className="text-blue-600 hover:text-blue-800"
            >
              rehobothchrisitianchurch2022@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}