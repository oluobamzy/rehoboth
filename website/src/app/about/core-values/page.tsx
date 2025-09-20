// src/app/about/core-values/page.tsx
'use client';

import React from 'react';
import Image from 'next/image';

export default function CoreValuesPage() {
  const coreValues = [
    {
      title: "Faith",
      description: "We believe in the power of faith to transform lives and communities. Our faith is rooted in the teachings of Jesus Christ and guides all our actions.",
      icon: "✝️"
    },
    {
      title: "Love",
      description: "Love is at the center of everything we do. We strive to show God's love to everyone we encounter, regardless of their background or circumstances.",
      icon: "❤️"
    },
    {
      title: "Community",
      description: "We believe in the importance of building strong, supportive communities where everyone belongs and can grow in their faith journey.",
      icon: "🤝"
    },
    {
      title: "Service",
      description: "We are called to serve others as Christ served us. Through acts of service, we demonstrate God's love and make a positive impact in our community.",
      icon: "🙏"
    },
    {
      title: "Excellence",
      description: "We strive for excellence in all that we do, honoring God with our best efforts and continuously growing in our faith and service.",
      icon: "⭐"
    },
    {
      title: "Integrity",
      description: "We maintain the highest standards of integrity, honesty, and transparency in all our relationships and endeavors.",
      icon: "🛡️"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Core Values</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              The foundational principles that guide our church community and shape our mission
            </p>
          </div>
        </div>
      </div>

      {/* Core Values Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreValues.map((value, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4 text-center">{value.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed text-center">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scripture Section */}
      <div className="bg-blue-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Rooted in Scripture</h2>
          <div className="max-w-4xl mx-auto">
            <blockquote className="text-xl italic text-gray-700 mb-4">
              "And whatever you do, whether in word or deed, do it all in the name of the Lord Jesus, 
              giving thanks to God the Father through him."
            </blockquote>
            <cite className="text-lg font-semibold text-blue-600">- Colossians 3:17</cite>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Live Out These Values With Us</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our community and discover how these core values can transform your life and the lives of those around you.
          </p>
          <div className="space-x-4">
            <a 
              href="/contact" 
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Visit Us
            </a>
            <a 
              href="/get-involved" 
              className="inline-block border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors"
            >
              Get Involved
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}