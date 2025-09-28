// src/app/ministries/youth/page.tsx
'use client';

import React from 'react';

export default function YouthMinistryPage() {
  const activities = [
    "Youth fellowship and Bible study sessions",
    "Leadership development programs",
    "Community service and outreach projects",
    "Social activities and team building events",
    "Mentorship and discipleship programs"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Youth Ministry</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              Empowering young people to live boldly for Christ
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
              Building young Christian leaders through fellowship, discipleship, and service to our community.
            </p>
            <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-500">
              <blockquote className="text-xl italic text-gray-700">
                "Don't let anyone look down on you because you are young, but set an example for the believers 
                in speech, in conduct, in love, in faith and in purity."
              </blockquote>
              <cite className="text-purple-600 font-semibold mt-2 block">- 1 Timothy 4:12</cite>
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
                      <span className="text-purple-500 mr-3 mt-1">•</span>
                      <span className="text-gray-600 leading-relaxed">{activity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Get Involved */}

      {/* Safety & Values */}
      <div className="bg-blue-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Safe Environment, Strong Values</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg p-6 shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Safety First</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Background-checked adult leaders
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Clear behavioral expectations
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Safe, supervised activities
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Open communication with parents
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-6 shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Values</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    Authentic relationships
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    Grace-centered approach
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    Inclusive community
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    Biblical truth with love
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Get Involved */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Youth Community</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Whether you're a teenager looking for community or an adult wanting to invest in the next generation, 
            there's a place for you in our youth ministry.
          </p>
          <div className="space-x-4">
            <a 
              href="/contact" 
              className="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Join Youth Group
            </a>
            <a 
              href="/get-involved/volunteering" 
              className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
            >
              Volunteer With Youth
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}