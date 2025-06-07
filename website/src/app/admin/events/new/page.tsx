"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/services/auth';
import ErrorMessage from '@/components/common/ErrorMessage';
import { createEvent } from '@/services/eventService';

export default function NewEventPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'service',
    start_datetime: '',
    end_datetime: '',
    location_name: '',
    location_address: '',
    registration_required: false,
    cost_cents: 0,
    is_published: false
  });

  // Redirect if not authenticated
  if (!user) {
    router.push('/auth/login');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convert cost to cents if entered in dollars
      const costInCents = Math.round(parseFloat(formData.cost_cents.toString()) * 100);
      
      const eventData = {
        ...formData,
        cost_cents: costInCents,
      };

      const { event, error: createError } = await createEvent(eventData);
      
      if (createError || !event) {
        throw new Error(createError || 'Failed to create event');
      }

      // Redirect to events admin page on success
      router.push('/admin/events');
    } catch (err) {
      console.error('Error creating event:', err);
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create New Event</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
              Event Title*
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="event_type">
              Event Type*
            </label>
            <select
              id="event_type"
              name="event_type"
              required
              value={formData.event_type}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="service">Church Service</option>
              <option value="meeting">Meeting</option>
              <option value="workshop">Workshop</option>
              <option value="social">Social Event</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location_name">
              Location Name
            </label>
            <input
              id="location_name"
              name="location_name"
              type="text"
              value={formData.location_name}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location_address">
              Location Address
            </label>
            <input
              id="location_address"
              name="location_address"
              type="text"
              value={formData.location_address}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="start_datetime">
              Start Date and Time*
            </label>
            <input
              id="start_datetime"
              name="start_datetime"
              type="datetime-local"
              required
              value={formData.start_datetime}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="end_datetime">
              End Date and Time*
            </label>
            <input
              id="end_datetime"
              name="end_datetime"
              type="datetime-local"
              required
              value={formData.end_datetime}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cost_cents">
              Cost (in dollars)
            </label>
            <input
              id="cost_cents"
              name="cost_cents"
              type="number"
              step="0.01"
              min="0"
              value={formData.cost_cents === 0 ? '' : formData.cost_cents / 100}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="0.00"
            />
          </div>

          <div className="flex items-center mt-2">
            <input
              id="registration_required"
              name="registration_required"
              type="checkbox"
              checked={formData.registration_required}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-gray-700 text-sm font-bold" htmlFor="registration_required">
              Registration Required
            </label>
          </div>

          <div className="flex items-center mt-2">
            <input
              id="is_published"
              name="is_published"
              type="checkbox"
              checked={formData.is_published}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-gray-700 text-sm font-bold" htmlFor="is_published">
              Publish Event
            </label>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
}
