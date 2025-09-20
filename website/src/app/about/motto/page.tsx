// src/app/about/motto/page.tsx
'use client';

import React from 'react';

export default function MottoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Our Motto</h1>
            <div className="max-w-4xl mx-auto">
              <p className="text-2xl md:text-3xl font-light mb-8 leading-relaxed">
                "Building Lives, Transforming Communities"
              </p>
              <p className="text-lg md:text-xl opacity-90 leading-relaxed">
                This motto encapsulates our mission to nurture individual spiritual growth while creating positive change in our broader community
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Motto Explanation */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Building Lives</h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  We believe that every individual has immense potential waiting to be unlocked. Through our various ministries, 
                  programs, and community support, we focus on building strong foundations in people's lives - spiritually, 
                  emotionally, and practically.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-emerald-600 mr-2">•</span>
                    Spiritual growth and discipleship
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-600 mr-2">•</span>
                    Personal development and life skills
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-600 mr-2">•</span>
                    Emotional and mental health support
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-600 mr-2">•</span>
                    Building meaningful relationships
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center">
                  <div className="text-6xl mb-4">🏗️</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Foundation Building</h3>
                  <p className="text-gray-600">
                    Every great structure needs a solid foundation. We help people build their lives on the solid rock of faith.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transforming Communities */}
      <div className="bg-blue-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center">
                  <div className="text-6xl mb-4">🌟</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Impact</h3>
                  <p className="text-gray-600">
                    When lives are transformed, communities flourish. We believe in being agents of positive change.
                  </p>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Transforming Communities</h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  Our impact extends far beyond our church walls. As we build strong individuals, we create ripple effects 
                  that transform families, neighborhoods, and entire communities through acts of service, love, and compassion.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Community outreach programs
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Social justice initiatives
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Educational and skill development programs
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Environmental stewardship
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Biblical Foundation */}
      <div className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Biblical Foundation</h2>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <blockquote className="text-xl italic text-gray-700 mb-4">
                "Therefore everyone who hears these words of mine and puts them into practice is like a wise man 
                who built his house on the rock. The rain came down, the streams rose, and the winds blew and beat 
                against that house; yet it did not fall, because it had its foundation on the rock."
              </blockquote>
              <cite className="text-lg font-semibold text-blue-600">- Matthew 7:24-25</cite>
            </div>
            <p className="text-lg text-gray-600 leading-relaxed">
              Our motto is deeply rooted in Scripture. Just as Jesus taught about building on a solid foundation, 
              we are committed to helping people build their lives on the unshakeable foundation of God's love and truth.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Us in This Mission</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Whether you're looking to build a stronger foundation in your own life or help transform our community, 
            there's a place for you at Rehoboth Christian Church.
          </p>
          <div className="space-x-4">
            <a 
              href="/contact" 
              className="inline-block bg-white text-emerald-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Visit Us This Sunday
            </a>
            <a 
              href="/get-involved" 
              className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-emerald-600 transition-colors"
            >
              Get Involved
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}