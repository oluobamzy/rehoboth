"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DatabaseErrorPage() {
  const [showDetails, setShowDetails] = useState(false);
  const [isDevEnvironment, setIsDevEnvironment] = useState(false);

  useEffect(() => {
    setIsDevEnvironment(process.env.NODE_ENV === 'development');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="sm:flex sm:items-start sm:justify-between">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Database Connection Error</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>
                    The application could not connect to the database. This is likely due to missing or incorrect environment variables.
                  </p>
                </div>
              </div>
              <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex-shrink-0 sm:flex sm:items-center">
                <svg className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            <div className="mt-5 border-t border-gray-200 pt-5">
              <h4 className="text-md font-medium text-gray-900">What&apos;s happening?</h4>
              <p className="mt-2 text-sm text-gray-500">
                Your application is trying to connect to a Supabase database, but the connection is failing. 
                This could be because:
              </p>
              <ul className="mt-3 list-disc pl-5 space-y-1 text-sm text-gray-500">
                <li>The environment variables are not set correctly</li>
                <li>The database credentials are invalid</li>
                <li>The database server is down or unreachable</li>
              </ul>
            </div>

            {isDevEnvironment && (
              <div className="mt-5 border-t border-gray-200 pt-5">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {showDetails ? 'Hide Development Instructions' : 'Show Development Instructions'}
                </button>

                {showDetails && (
                  <div className="mt-3 bg-gray-50 p-4 rounded-md">
                    <h5 className="text-sm font-medium text-gray-900">How to fix this in development:</h5>
                    <ol className="mt-2 list-decimal pl-5 space-y-2 text-sm text-gray-700">
                      <li>
                        Create a <code className="font-mono bg-gray-100 px-1">.env.local</code> file in the root of your project
                      </li>
                      <li>
                        Add the following lines with your actual values:
                        <pre className="mt-1 bg-gray-800 text-white p-2 rounded-md overflow-x-auto">
                          <code>
                            NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co<br />
                            NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
                          </code>
                        </pre>
                      </li>
                      <li>
                        You can find these values in your Supabase project dashboard under Project Settings &gt; API
                      </li>
                      <li>
                        After adding these values, restart your development server
                      </li>
                    </ol>
                  </div>
                )}
              </div>
            )}

            <div className="mt-5">
              <Link href="/" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Return to Home Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
