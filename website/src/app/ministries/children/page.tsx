// src/app/ministries/children/page.tsx
'use client';

import React from 'react';
import Image from 'next/image';

export default function ChildrensMinistryPage() {
  const activities = [
    "Sunday school classes for all ages",
    "Children's Church during adult service", 
    "Bible study and memorization programs",
    "Fun games and interactive learning activities",
    "Arts and crafts projects with Christian themes"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Children's Ministry</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              Nurturing young hearts and minds in God's love
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
              Nurturing young hearts and minds in God's love through biblical teaching and Christian fellowship.
            </p>
            <div className="bg-yellow-50 rounded-lg p-6 border-l-4 border-yellow-500">
              <blockquote className="text-xl italic text-gray-700">
                "Let the little children come to me, and do not hinder them, for the kingdom of heaven belongs to such as these."
              </blockquote>
              <cite className="text-yellow-600 font-semibold mt-2 block">- Matthew 19:14</cite>
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
                      <span className="text-yellow-500 mr-3 mt-1">•</span>
                      <span className="text-gray-600 leading-relaxed">{activity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Volunteer Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Join Our Team</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              We're always looking for volunteers who love working with children and want to make a 
              difference in their spiritual development.
            </p>
            <a 
              href="/get-involved/volunteering" 
              className="inline-block bg-yellow-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
            >
              Volunteer Today
            </a>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Get Involved</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Have questions about our Children's Ministry? Want to get your child involved? We'd love to hear from you!
          </p>
          <div className="space-x-4">
            <a 
              href="/contact" 
              className="inline-block bg-white text-yellow-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Contact Us
            </a>
            <a 
              href="/events" 
              className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-yellow-600 transition-colors"
            >
              View Events
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}