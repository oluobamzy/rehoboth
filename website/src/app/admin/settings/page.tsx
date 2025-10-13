'use client';

import { useState, useEffect } from 'react';
import { useChurchSettings } from '@/hooks/useChurchSettings';
import Button from '@/components/common/Button';
import { motion } from 'framer-motion';

interface FormData {
  // Contact Information
  church_name: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  zip_code: string;
  phone_main: string;
  email_main: string;
  email_contact: string;
  google_maps_url: string;
  
  // Social Media
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
  twitter_url: string;
  youtube_channel_id: string;
  youtube_handle: string;
  
  // Services (as JSON string for editing)
  service_times: string;
  
  // General
  church_description: string;
}

export default function AdminSettingsPage() {
  const { settings, isLoading, error: fetchError, refresh, updateMultipleSettings } = useChurchSettings();
  const [formData, setFormData] = useState<FormData>({
    church_name: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    zip_code: '',
    phone_main: '',
    email_main: '',
    email_contact: '',
    google_maps_url: '',
    facebook_url: '',
    instagram_url: '',
    youtube_url: '',
    twitter_url: '',
    youtube_channel_id: '',
    youtube_handle: '',
    service_times: '',
    church_description: ''
  });
  
  const [activeTab, setActiveTab] = useState<'contact' | 'social' | 'services' | 'general'>('contact');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Load settings into form when they're available
  useEffect(() => {
    if (settings) {
      setFormData({
        church_name: settings.church_name || '',
        address_line_1: settings.address_line_1 || '',
        address_line_2: settings.address_line_2 || '',
        city: settings.city || '',
        state: settings.state || '',
        zip_code: settings.zip_code || '',
        phone_main: settings.phone_main || '',
        email_main: settings.email_main || '',
        email_contact: settings.email_contact || '',
        google_maps_url: settings.google_maps_url || '',
        facebook_url: settings.facebook_url || '',
        instagram_url: settings.instagram_url || '',
        youtube_url: settings.youtube_url || '',
        twitter_url: settings.twitter_url || '',
        youtube_channel_id: settings.youtube_channel_id || '',
        youtube_handle: settings.youtube_handle || '',
        service_times: JSON.stringify(settings.service_times, null, 2),
        church_description: settings.church_description || ''
      });
    }
  }, [settings]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate required fields
    if (!formData.church_name.trim()) errors.church_name = 'Church name is required';
    if (!formData.address_line_1.trim()) errors.address_line_1 = 'Address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.zip_code.trim()) errors.zip_code = 'ZIP code is required';
    if (!formData.phone_main.trim()) errors.phone_main = 'Phone number is required';
    if (!formData.email_main.trim()) errors.email_main = 'Email is required';

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email_main && !emailRegex.test(formData.email_main)) {
      errors.email_main = 'Please enter a valid email address';
    }
    if (formData.email_contact && !emailRegex.test(formData.email_contact)) {
      errors.email_contact = 'Please enter a valid email address';
    }

    // Validate URLs
    const urlFields = ['facebook_url', 'instagram_url', 'youtube_url', 'twitter_url', 'google_maps_url'];
    urlFields.forEach(field => {
      const value = formData[field as keyof FormData];
      if (value && value.trim()) {
        try {
          new URL(value);
        } catch {
          errors[field] = 'Please enter a valid URL';
        }
      }
    });

    // Validate JSON for service times
    if (formData.service_times.trim()) {
      try {
        JSON.parse(formData.service_times);
      } catch {
        errors.service_times = 'Please enter valid JSON for service times';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSuccess(false);

    try {
      const updates = Object.entries(formData).map(([key, value]) => ({
        key,
        value: value.toString()
      }));

      await updateMultipleSettings(updates);
      await refresh();
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Settings</h3>
          <p className="text-red-700">{fetchError}</p>
          <Button onClick={refresh} className="mt-4" variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'contact' as const, name: 'Contact Info', icon: '📞' },
    { id: 'social' as const, name: 'Social Media', icon: '📱' },
    { id: 'services' as const, name: 'Service Times', icon: '⏰' },
    { id: 'general' as const, name: 'General', icon: '⚙️' }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Church Settings</h1>
        <p className="text-gray-600">Manage your church's contact information, social media links, and other settings.</p>
      </div>

      {/* Success/Error Messages */}
      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4"
        >
          <p className="text-green-700 font-medium">✅ Settings saved successfully!</p>
        </motion.div>
      )}

      {saveError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <p className="text-red-700 font-medium">❌ {saveError}</p>
        </motion.div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Contact Information Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Church Name *
                    </label>
                    <input
                      type="text"
                      value={formData.church_name}
                      onChange={(e) => handleInputChange('church_name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.church_name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter church name"
                    />
                    {validationErrors.church_name && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.church_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Main Phone *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone_main}
                      onChange={(e) => handleInputChange('phone_main', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.phone_main ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="(555) 123-4567"
                    />
                    {validationErrors.phone_main && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.phone_main}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      value={formData.address_line_1}
                      onChange={(e) => handleInputChange('address_line_1', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.address_line_1 ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Street address"
                    />
                    {validationErrors.address_line_1 && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.address_line_1}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      value={formData.address_line_2}
                      onChange={(e) => handleInputChange('address_line_2', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Apartment, suite, etc. (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.city ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="City"
                    />
                    {validationErrors.city && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.city}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validationErrors.state ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="MA"
                        maxLength={2}
                      />
                      {validationErrors.state && (
                        <p className="text-red-600 text-sm mt-1">{validationErrors.state}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        value={formData.zip_code}
                        onChange={(e) => handleInputChange('zip_code', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validationErrors.zip_code ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="02769"
                      />
                      {validationErrors.zip_code && (
                        <p className="text-red-600 text-sm mt-1">{validationErrors.zip_code}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Main Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email_main}
                      onChange={(e) => handleInputChange('email_main', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.email_main ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="info@church.org"
                    />
                    {validationErrors.email_main && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.email_main}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Form Email
                    </label>
                    <input
                      type="email"
                      value={formData.email_contact}
                      onChange={(e) => handleInputChange('email_contact', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.email_contact ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="contact@church.org"
                    />
                    {validationErrors.email_contact && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.email_contact}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Google Maps Embed URL
                    </label>
                    <input
                      type="url"
                      value={formData.google_maps_url}
                      onChange={(e) => handleInputChange('google_maps_url', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.google_maps_url ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="https://maps.google.com/maps?..."
                    />
                    {validationErrors.google_maps_url && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.google_maps_url}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Get this URL from Google Maps by clicking Share → Embed a map
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Media Tab */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook URL
                    </label>
                    <input
                      type="url"
                      value={formData.facebook_url}
                      onChange={(e) => handleInputChange('facebook_url', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.facebook_url ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="https://facebook.com/yourchurch"
                    />
                    {validationErrors.facebook_url && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.facebook_url}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram URL
                    </label>
                    <input
                      type="url"
                      value={formData.instagram_url}
                      onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.instagram_url ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="https://instagram.com/yourchurch"
                    />
                    {validationErrors.instagram_url && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.instagram_url}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      YouTube URL
                    </label>
                    <input
                      type="url"
                      value={formData.youtube_url}
                      onChange={(e) => handleInputChange('youtube_url', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.youtube_url ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="https://youtube.com/yourchurch"
                    />
                    {validationErrors.youtube_url && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.youtube_url}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter URL
                    </label>
                    <input
                      type="url"
                      value={formData.twitter_url}
                      onChange={(e) => handleInputChange('twitter_url', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.twitter_url ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="https://twitter.com/yourchurch"
                    />
                    {validationErrors.twitter_url && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.twitter_url}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      YouTube Channel ID
                    </label>
                    <input
                      type="text"
                      value={formData.youtube_channel_id}
                      onChange={(e) => handleInputChange('youtube_channel_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="UC-yUYcusNxkfA2qyjQMFblA"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Used for live streaming integration
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      YouTube Handle
                    </label>
                    <input
                      type="text"
                      value={formData.youtube_handle}
                      onChange={(e) => handleInputChange('youtube_handle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="@YourChurch"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Your YouTube channel handle (e.g., @YourChurch)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Service Times Tab */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Service Times</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Schedule (JSON Format)
                  </label>
                  <textarea
                    value={formData.service_times}
                    onChange={(e) => handleInputChange('service_times', e.target.value)}
                    rows={12}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono ${
                      validationErrors.service_times ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={`{
  "sunday": "3:00 PM - 6:00 PM",
  "wednesday": "7:00 PM - 9:00 PM (Prayer Service)",
  "friday": "Women Overnight Service",
  "saturday": "7:00 PM - 9:00 PM (Youth Prayer & Choir)"
}`}
                  />
                  {validationErrors.service_times && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.service_times}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    Define your service schedule in JSON format. Use day names as keys and service descriptions as values.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Church Description
                  </label>
                  <textarea
                    value={formData.church_description}
                    onChange={(e) => handleInputChange('church_description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description of your church..."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This description appears in the footer and other places on your website.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="min-w-24"
            >
              {saving ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                'Save Settings'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}