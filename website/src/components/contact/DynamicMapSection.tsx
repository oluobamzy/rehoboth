'use client';

import { useChurchSettings } from '@/hooks/useChurchSettings';

export default function DynamicMapSection() {
  const { settings, isLoading } = useChurchSettings();

  if (isLoading || !settings) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Find Us</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="aspect-video w-full bg-gray-200 animate-pulse"></div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="h-6 bg-gray-200 rounded mb-3 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div>
                <div className="h-6 bg-gray-200 rounded mb-3 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Build Google Maps URLs
  const addressQuery = encodeURIComponent(
    `${settings.address_line_1}${settings.address_line_2 ? ', ' + settings.address_line_2 : ''}, ${settings.city}, ${settings.state} ${settings.zip_code}`
  );

  const embedUrl = settings.google_maps_url || 
    `https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=en&amp;q=${addressQuery}&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=&amp;output=embed`;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${addressQuery}`;

  return (
    <div className="mt-12">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Find Us</h2>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="aspect-video w-full">
          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`${settings.church_name} Location`}
          ></iframe>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Our Address</h3>
              <p className="text-gray-600 mb-2">
                <strong>{settings.address_line_1}</strong>
                {settings.address_line_2 && <><br />{settings.address_line_2}</>}
                <br />
                {settings.city}, {settings.state} {settings.zip_code}
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Directions</h3>
              <a 
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}