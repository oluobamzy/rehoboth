'use client';

import { useChurchSettings } from '@/hooks/useChurchSettings';

export default function DynamicContactInfo() {
  const { settings, isLoading } = useChurchSettings();

  if (isLoading || !settings) {
    return (
      <div className="mt-12 grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-blue-50 p-6 rounded-lg shadow-sm">
            <div className="h-6 bg-gray-200 rounded mb-3 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-12 grid md:grid-cols-3 gap-6">
      <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-medium mb-3 text-blue-700">Service Times</h3>
        {Object.entries(settings.service_times).map(([day, time]) => (
          <p key={day} className="capitalize">
            {day}: {time}
          </p>
        ))}
      </div>
      
      <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-medium mb-3 text-blue-700">Location</h3>
        <p>{settings.address_line_1}</p>
        {settings.address_line_2 && <p>{settings.address_line_2}</p>}
        <p>{settings.city}, {settings.state} {settings.zip_code}</p>
      </div>
      
      <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-medium mb-3 text-blue-700">Contact Information</h3>
        <p>Email: {settings.email_main}</p>
        <p>Phone: {settings.phone_main}</p>
      </div>
    </div>
  );
}