'use client';

import React, { useState } from 'react';

export default function EmailTestPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to test email', details: error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Email Configuration Test</h1>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important Setup Notes:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Make sure your Gmail app password is real (not the dummy one)</li>
          <li>• Gmail app passwords look like: <code>abcd efgh ijkl mnop</code> (16 characters with spaces)</li>
          <li>• You need to enable 2-factor authentication on Gmail first</li>
          <li>• Generate app password at: <a href="https://myaccount.google.com/apppasswords" className="underline" target="_blank">Google App Passwords</a></li>
        </ul>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <form onSubmit={testEmail} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Test Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email to send test invitation"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending Test Email...' : 'Send Test Email'}
          </button>
        </form>

        {result && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Test Results:</h3>
            
            {result.success ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-green-800 font-semibold">✅ Success!</h4>
                <p className="text-green-700">{result.message}</p>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-red-800 font-semibold">❌ Failed</h4>
                <p className="text-red-700">{result.error}</p>
                {result.details && (
                  <p className="text-red-600 text-sm mt-2">Details: {result.details}</p>
                )}
              </div>
            )}

            {result.emailConfig && (
              <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Email Configuration:</h4>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(result.emailConfig, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">📧 Current Email Settings (.env):</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>Host:</strong> smtp.gmail.com</p>
          <p><strong>Port:</strong> 587</p>
          <p><strong>User:</strong> rehobothchurchdev@gmail.com</p>
          <p><strong>From:</strong> Rehoboth Church &lt;rehobothchurchdev@gmail.com&gt;</p>
          <p><strong>Password:</strong> {"tjwr rajr viih sbnm".includes("tjwr") ? "⚠️ DUMMY PASSWORD - NEEDS REAL APP PASSWORD" : "✅ Set"}</p>
        </div>
      </div>
    </div>
  );
}