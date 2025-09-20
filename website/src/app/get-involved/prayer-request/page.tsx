// src/app/get-involved/prayer-request/page.tsx
'use client';

import React, { useState } from 'react';

export default function PrayerRequestPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    requestType: '',
    urgency: '',
    prayerRequest: '',
    anonymous: false,
    publicShare: false,
    followUp: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const requestTypes = [
    'Health & Healing',
    'Family & Relationships',
    'Financial Provision',
    'Career & Work',
    'Spiritual Growth',
    'Grief & Loss',
    'Mental Health',
    'Addiction Recovery',
    'Protection & Safety',
    'Thanksgiving & Praise',
    'Other'
  ];

  const urgencyLevels = [
    { value: 'routine', label: 'Routine - General prayer support' },
    { value: 'urgent', label: 'Urgent - Immediate prayer needed' },
    { value: 'emergency', label: 'Emergency - Critical situation' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Here you would implement the actual form submission logic
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitMessage('Your prayer request has been submitted successfully. Our prayer team will be praying for you.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        requestType: '',
        urgency: '',
        prayerRequest: '',
        anonymous: false,
        publicShare: false,
        followUp: false
      });
    } catch (error) {
      setSubmitMessage('There was an error submitting your request. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const prayerMinistryInfo = [
    {
      title: "Confidential Prayer",
      description: "All prayer requests are treated with complete confidentiality unless you specifically request otherwise.",
      icon: "🔒"
    },
    {
      title: "Dedicated Prayer Team",
      description: "Our trained prayer team commits to praying for each request regularly and systematically.",
      icon: "👥"
    },
    {
      title: "Pastoral Follow-up",
      description: "For urgent requests, our pastoral team may reach out to provide additional support and care.",
      icon: "🤝"
    },
    {
      title: "24/7 Prayer Line",
      description: "For immediate prayer needs, call our prayer line at [phone number] available around the clock.",
      icon: "📞"
    }
  ];

  const prayerPromises = [
    {
      verse: "Therefore I tell you, whatever you ask for in prayer, believe that you have received it, and it will be yours.",
      reference: "Mark 11:24"
    },
    {
      verse: "The prayer of a righteous person is powerful and effective.",
      reference: "James 5:16"
    },
    {
      verse: "Cast all your anxiety on him because he cares for you.",
      reference: "1 Peter 5:7"
    },
    {
      verse: "And my God will meet all your needs according to the riches of his glory in Christ Jesus.",
      reference: "Philippians 4:19"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Prayer Requests</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              We believe in the power of prayer and would be honored to pray for you and your needs
            </p>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">You Are Not Alone</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Whatever you're facing—whether it's a challenge, a blessing to celebrate, or simply a need for 
              guidance—our church family wants to stand with you in prayer. We believe that God hears our prayers 
              and that there is power when we come together to seek His will.
            </p>
            <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
              <blockquote className="text-xl italic text-gray-700">
                "Again, truly I tell you that if two of you on earth agree about anything they ask for, 
                it will be done for them by my Father in heaven."
              </blockquote>
              <cite className="text-blue-600 font-semibold mt-2 block">- Matthew 18:19</cite>
            </div>
          </div>
        </div>
      </div>

      {/* Prayer Form */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Submit Your Prayer Request</h2>
            
            {submitMessage && (
              <div className={`mb-8 p-4 rounded-lg ${submitMessage.includes('successfully') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                {submitMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name {!formData.anonymous && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={formData.anonymous}
                    required={!formData.anonymous}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={formData.anonymous}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={formData.anonymous}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label htmlFor="requestType" className="block text-sm font-medium text-gray-700 mb-2">
                    Request Type
                  </label>
                  <select
                    id="requestType"
                    name="requestType"
                    value={formData.requestType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    {requestTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency Level <span className="text-red-500">*</span>
                </label>
                <select
                  id="urgency"
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select urgency level</option>
                  {urgencyLevels.map((level) => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="prayerRequest" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Prayer Request <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="prayerRequest"
                  name="prayerRequest"
                  value={formData.prayerRequest}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  placeholder="Please share your prayer request with us. Be as specific or general as you feel comfortable."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="anonymous"
                    name="anonymous"
                    checked={formData.anonymous}
                    onChange={handleInputChange}
                    className="mt-1 mr-3"
                  />
                  <label htmlFor="anonymous" className="text-sm text-gray-700">
                    Submit this request anonymously (your contact information will not be stored)
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="publicShare"
                    name="publicShare"
                    checked={formData.publicShare}
                    onChange={handleInputChange}
                    className="mt-1 mr-3"
                  />
                  <label htmlFor="publicShare" className="text-sm text-gray-700">
                    I'm comfortable with this request being shared publicly (names will be kept confidential)
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="followUp"
                    name="followUp"
                    checked={formData.followUp}
                    onChange={handleInputChange}
                    disabled={formData.anonymous}
                    className="mt-1 mr-3 disabled:opacity-50"
                  />
                  <label htmlFor="followUp" className="text-sm text-gray-700">
                    I would like someone from the pastoral team to follow up with me
                  </label>
                </div>
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Prayer Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Prayer Ministry Info */}
      <div className="bg-purple-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How We Handle Your Requests</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {prayerMinistryInfo.map((info, index) => (
                <div key={index} className="bg-white rounded-lg p-6 text-center shadow">
                  <div className="text-4xl mb-4">{info.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{info.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{info.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scripture Promises */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">God's Promises About Prayer</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {prayerPromises.map((promise, index) => (
                <div key={index} className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
                  <blockquote className="text-gray-700 italic mb-3">"{promise.verse}"</blockquote>
                  <cite className="text-blue-600 font-semibold">- {promise.reference}</cite>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-red-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Emergency Prayer Line</h2>
            <p className="text-lg text-gray-600 mb-4">
              For immediate prayer needs or crisis situations, our 24/7 prayer line is available:
            </p>
            <p className="text-2xl font-bold text-red-600">613-400-4966</p>
            <p className="text-sm text-gray-500 mt-2">
              If no one answers immediately, please leave a message and someone will call you back as soon as possible.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Let Us Pray With You</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Don't carry your burdens alone. Share your prayer requests with us and experience the power of 
            community prayer and God's faithful love.
          </p>
          <a 
            href="#prayer-form" 
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Submit Your Request
          </a>
        </div>
      </div>
    </div>
  );
}