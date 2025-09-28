// src/app/ministries/community-support/page.tsx
'use client';

import React from 'react';

export default function CommunitySupportMinistryPage() {
  const activities = [
    "Food assistance and distribution programs",
    "Clothing and household item donations",
    "Financial assistance for emergency needs", 
    "Community outreach and volunteer coordination",
    "Support for vulnerable families and individuals"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Community Support Ministry</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              Demonstrating Christ's love through practical care and support for our neighbors in need
            </p>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Mission</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Serving our community through practical support, resources, and Christian compassion for those in need.
            </p>
            <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
              <blockquote className="text-xl italic text-gray-700">
                "Religion that God our Father accepts as pure and faultless is this: to look after orphans 
                and widows in their distress and to keep oneself from being polluted by the world."
              </blockquote>
              <cite className="text-green-600 font-semibold mt-2 block">- James 1:27</cite>
            </div>
          </div>
        </div>
      </div>

      {/* Activities Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Ministry Focus</h2>
            <div className="grid lg:grid-cols-1 gap-8 max-w-3xl mx-auto">
              <div className="bg-gray-50 rounded-lg p-8 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6">What We Do</h3>
                <ul className="space-y-4">
                  {activities.map((activity, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-3 mt-1">•</span>
                      <span className="text-gray-600 leading-relaxed">{activity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How to Get Help */}
      <div className="bg-emerald-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How to Receive Support</h2>
            <div className="bg-white rounded-lg p-8 shadow">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      Call the church office during business hours
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      Speak with a pastor or ministry leader
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      Fill out a support request form
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      Visit us during designated support hours
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">What to Expect</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <span className="text-emerald-500 mr-2">•</span>
                      Confidential conversation about your needs
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-500 mr-2">•</span>
                      Assessment of available resources
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-500 mr-2">•</span>
                      Connection with appropriate programs
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-500 mr-2">•</span>
                      Ongoing support and follow-up
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Get Involved */}

      {/* Impact Section */}
      <div className="bg-green-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Impact</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-3xl font-bold text-green-600 mb-2">150+</div>
                <p className="text-gray-700 font-semibold">Families Served</p>
                <p className="text-sm text-gray-600">Monthly through our programs</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-3xl font-bold text-emerald-600 mb-2">500+</div>
                <p className="text-gray-700 font-semibold">Meals Provided</p>
                <p className="text-sm text-gray-600">Through food bank ministry</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-3xl font-bold text-green-600 mb-2">2000+</div>
                <p className="text-gray-700 font-semibold">Volunteer Hours</p>
                <p className="text-sm text-gray-600">Dedicated annually</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Get Involved in Community Support</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Whether you need support or want to help others, there's a place for you in our community support ministry.
          </p>
          <div className="space-x-4">
            <a 
              href="/contact" 
              className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Request Support
            </a>
            <a 
              href="/get-involved/volunteering" 
              className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
            >
              Volunteer Today
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}