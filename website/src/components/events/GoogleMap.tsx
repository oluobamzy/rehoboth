'use client';

// Placeholder component for Google Maps integration
// In a real implementation, this would use the Google Maps API
export default function GoogleMap({ location, name, address }) {
  return (
    <div className="flex items-center justify-center h-full w-full bg-gray-100">
      <div className="text-center p-4">
        <p className="font-semibold text-gray-700">{name || 'Location'}</p>
        {address && <p className="text-sm text-gray-600 mt-1">{address}</p>}
        <p className="text-xs text-gray-500 mt-3">
          Map would be displayed here in production using Google Maps API
        </p>
      </div>
    </div>
  );
}
