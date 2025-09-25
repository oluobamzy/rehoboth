"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/services/auth';
import ErrorMessage from '@/components/common/ErrorMessage';
import { fetchEventById, updateEvent, deleteEvent, Event, uploadEventImage } from '@/services/eventService';
import { supabase } from '@/services/supabase';
import Link from 'next/link';
import Image from 'next/image';

interface EventEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EventEditPage({ params }: EventEditPageProps) {
  const { id: eventId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: '',
    start_datetime: '',
    end_datetime: '',
    location_name: '',
    location_address: '',
    registration_required: false,
    registration_deadline: '',
    max_capacity: 0,
    cost_cents: 0,
    image_url: '',
    contact_email: '',
    contact_phone: '',
    is_featured: false,
    is_published: false,
    category: ''
  });

  // Load event data
  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.push('/auth/login');
      return;
    }

    async function loadEvent() {
      try {
        setLoading(true);
        const { event: eventData, error: eventError } = await fetchEventById(eventId);
        
        if (eventError) {
          throw new Error(eventError);
        }
        
        if (!eventData) {
          throw new Error('Event not found');
        }
        
        setEvent(eventData);
        
        // Format dates for datetime-local inputs
        const formatDateForInput = (dateString: string) => {
          const date = new Date(dateString);
          return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
        };
        
        // Prepare registration deadline if it exists
        let formattedDeadline = '';
        if (eventData.registration_deadline) {
          formattedDeadline = formatDateForInput(eventData.registration_deadline);
        }
        
        setFormData({
          title: eventData.title || '',
          description: eventData.description || '',
          event_type: eventData.event_type || '',
          start_datetime: formatDateForInput(eventData.start_datetime),
          end_datetime: formatDateForInput(eventData.end_datetime),
          location_name: eventData.location_name || '',
          location_address: eventData.location_address || '',
          registration_required: eventData.registration_required || false,
          registration_deadline: formattedDeadline,
          max_capacity: eventData.max_capacity || 0,
          cost_cents: eventData.cost_cents || 0,
          image_url: eventData.image_url || '',
          contact_email: eventData.contact_email || '',
          contact_phone: eventData.contact_phone || '',
          is_featured: eventData.is_featured || false,
          is_published: eventData.is_published || false,
          category: eventData.category || ''
        });
      } catch (err) {
        console.error('Error loading event:', err);
        setError(err instanceof Error ? err.message : 'Failed to load event');
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [eventId, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'cost_cents' && type === 'number') {
      // Convert dollars to cents for the database
      const dollars = parseFloat(value);
      setFormData(prev => ({
        ...prev,
        cost_cents: isNaN(dollars) ? 0 : Math.round(dollars * 100)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    // Reset the file input
    const fileInput = document.getElementById('image_file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile || !event) return;

    setUploadingImage(true);
    try {
      const { url } = await uploadEventImage(imageFile, event.id);
      
      // Update the event with the new image URL
      const { error: updateError } = await supabase
        .from('events')
        .update({ image_url: url })
        .eq('id', event.id);
        
      if (updateError) {
        throw new Error('Failed to update event with image URL');
      }

      // Update local state
      setFormData(prev => ({ ...prev, image_url: url }));
      setEvent(prev => prev ? { ...prev, image_url: url } : null);
      
      // Clear the file input
      setImageFile(null);
      setImagePreview(null);
      const fileInput = document.getElementById('image_file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
      setError('Image uploaded successfully!');
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error('Image upload failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!event) {
        throw new Error('Event not found');
      }

      // Prepare event data with proper timestamp handling
      const eventData = {
        ...formData,
        id: event.id,
        // Convert empty strings to undefined for optional timestamp fields
        registration_deadline: formData.registration_deadline || undefined,
        // Ensure required datetime fields are not empty
        start_datetime: formData.start_datetime,
        end_datetime: formData.end_datetime,
      };

      const { success, error: updateError } = await updateEvent(eventData);
      
      if (!success || updateError) {
        throw new Error(updateError || 'Failed to update event');
      }

      // Redirect to events admin page on success
      router.push('/admin/events');
    } catch (err) {
      console.error('Error updating event:', err);
      setError(err instanceof Error ? err.message : 'Failed to update event');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    // Simple confirmation
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);

      const { success, error: deleteError } = await deleteEvent(eventId);
      
      if (!success || deleteError) {
        throw new Error(deleteError || 'Failed to delete event');
      }

      // Redirect to events admin page on success
      router.push('/admin/events');
    } catch (err) {
      console.error('Error deleting event:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete event');
      setDeleting(false);
    }
  };

  if (!user) {
    return null; // Handled by useEffect redirect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Event</h1>
        <div className="space-x-2">
          <Link
            href="/admin/events"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Back to Events
          </Link>
          {event && event.registration_required && (
            <Link
              href={`/admin/events/${event.id}/registrations`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              View Registrations
            </Link>
          )}
          {event && (
            <Link
              href={`/events/${event.id}`}
              target="_blank"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              View Event Page
            </Link>
          )}
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Event Preview Section */}
          {event && (
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Event Preview</h2>
              
              {/* Event Image Display */}
              <div className="mb-4">
                <div className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden">
                  {formData.image_url ? (
                    <>
                      <Image
                        src={formData.image_url}
                        alt={formData.title}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          console.error('Error loading admin event image:', formData.image_url);
                        }}
                        onLoad={() => {
                          console.log('✅ Admin event image loaded successfully:', formData.image_url);
                        }}
                      />
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        Current Image
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-4.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                        <span className="text-gray-400 text-sm">No Image Available</span>
                        <p className="text-xs text-gray-500 mt-1">Upload an image below</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-600">Title:</span>
                  <p className="text-gray-800">{formData.title}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Type:</span>
                  <p className="text-gray-800 capitalize">{formData.event_type}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Status:</span>
                  <p className={`font-medium ${formData.is_published ? 'text-green-600' : 'text-orange-600'}`}>
                    {formData.is_published ? 'Published' : 'Draft'}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Featured:</span>
                  <p className={`font-medium ${formData.is_featured ? 'text-blue-600' : 'text-gray-600'}`}>
                    {formData.is_featured ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>
          )}

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

              <div className="col-span-2">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Event Image
                </label>
                <div className="space-y-4">
                  {/* Current Image Display */}
                  {formData.image_url && !imagePreview && (
                    <div className="relative">
                      <p className="text-sm text-gray-600 mb-2">Current image:</p>
                      <Image
                        src={formData.image_url}
                        alt="Current event image"
                        width={400}
                        height={200}
                        className="w-full max-w-md h-48 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  
                  {/* Image Upload */}
                  <input
                    id="image_file"
                    name="image_file"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                  
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="relative">
                      <p className="text-sm text-gray-600 mb-2">New image preview:</p>
                      <img
                        src={imagePreview}
                        alt="Event preview"
                        className="w-full max-w-md h-48 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-8 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  {imageFile && (
                    <button
                      type="button"
                      onClick={handleImageUpload}
                      disabled={uploadingImage}
                      className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${
                        uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {uploadingImage ? 'Uploading...' : 'Upload New Image'}
                    </button>
                  )}
                  
                  <p className="text-sm text-gray-500">
                    Upload an image to represent your event. Recommended size: 800x400px or similar aspect ratio.
                  </p>
                </div>
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
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                  Category
                </label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  value={formData.category}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="e.g., Youth, Adults, Seniors"
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

              <div>
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
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image_url">
                  Image URL
                </label>
                <input
                  id="image_url"
                  name="image_url"
                  type="text"
                  value={formData.image_url}
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

              <div className="flex items-center mt-4">
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

              <div className="flex items-center mt-4">
                <input
                  id="is_featured"
                  name="is_featured"
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-gray-700 text-sm font-bold" htmlFor="is_featured">
                  Featured Event
                </label>
              </div>

              <div className="flex items-center mt-4">
                <input
                  id="is_published"
                  name="is_published"
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-gray-700 text-sm font-bold" htmlFor="is_published">
                  Published
                </label>
              </div>

              {formData.registration_required && (
                <>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="registration_deadline">
                      Registration Deadline
                    </label>
                    <input
                      id="registration_deadline"
                      name="registration_deadline"
                      type="datetime-local"
                      value={formData.registration_deadline}
                      onChange={handleChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="max_capacity">
                      Maximum Capacity
                    </label>
                    <input
                      id="max_capacity"
                      name="max_capacity"
                      type="number"
                      min="0"
                      value={formData.max_capacity || ''}
                      onChange={handleChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contact_email">
                  Contact Email
                </label>
                <input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contact_phone">
                  Contact Phone
                </label>
                <input
                  id="contact_phone"
                  name="contact_phone"
                  type="tel"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors ${
                  deleting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {deleting ? 'Deleting...' : 'Delete Event'}
              </button>
              
              <button
                type="submit"
                disabled={saving}
                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
                  saving ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
