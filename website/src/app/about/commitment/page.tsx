// src/app/about/commitment/page.tsx
'use client';

import React from 'react';

export default function CommitmentPage() {
  const commitments = [
    {
      title: "To God",
      description: "We are committed to honoring God in all we do, seeking His will, and following the teachings of Jesus Christ.",
      points: [
        "Worship and praise in spirit and truth",
        "Study and application of God's Word",
        "Prayer and communion with God",
        "Living according to biblical principles"
      ],
      icon: "✝️",
      color: "from-blue-500 to-purple-600"
    },
    {
      title: "To Our Community",
      description: "We are dedicated to building a loving, inclusive community where everyone can grow in faith and fellowship.",
      points: [
        "Creating a welcoming environment for all",
        "Supporting one another through life's challenges",
        "Celebrating together in times of joy",
        "Building lasting relationships and friendships"
      ],
      icon: "🤝",
      color: "from-emerald-500 to-teal-600"
    },
    {
      title: "To Our Neighborhood",
      description: "We are committed to being a positive force in our local community and beyond.",
      points: [
        "Serving those in need",
        "Supporting local initiatives and causes",
        "Being good neighbors and stewards",
        "Addressing social justice issues"
      ],
      icon: "🏘️",
      color: "from-orange-500 to-red-600"
    },
    {
      title: "To Excellence",
      description: "We strive for excellence in everything we do, giving our best for God's glory.",
      points: [
        "Quality in all our programs and services",
        "Continuous learning and improvement",
        "Professional and ethical conduct",
        "Accountability and transparency"
      ],
      icon: "⭐",
      color: "from-yellow-500 to-orange-600"
    },
    {
      title: "To Growth",
      description: "We are committed to personal and collective spiritual growth and development.",
      points: [
        "Discipleship and mentoring programs",
        "Educational opportunities for all ages",
        "Leadership development",
        "Encouraging gifts and talents"
      ],
      icon: "🌱",
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "To Mission",
      description: "We are dedicated to sharing the Gospel and making disciples locally and globally.",
      points: [
        "Evangelism and outreach programs",
        "Missionary support and partnerships",
        "Cross-cultural ministry",
        "Digital and social media outreach"
      ],
      icon: "🌍",
      color: "from-indigo-500 to-blue-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Commitment</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              The promises we make to God, our community, and the world around us
            </p>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">What We Promise</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              At Rehoboth Christian Church, our commitments are not just words on a page—they are the driving force 
              behind everything we do. These sacred promises guide our decisions, shape our programs, and define our 
              character as a church community.
            </p>
          </div>
        </div>
      </div>

      {/* Commitments Grid */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8">
            {commitments.map((commitment, index) => (
              <div key={index} className="bg-gray-50 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className={`bg-gradient-to-r ${commitment.color} p-6 text-white`}>
                  <div className="flex items-center">
                    <span className="text-4xl mr-4">{commitment.icon}</span>
                    <h3 className="text-2xl font-bold">{commitment.title}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {commitment.description}
                  </p>
                  <ul className="space-y-3">
                    {commitment.points.map((point, pointIndex) => (
                      <li key={pointIndex} className="flex items-start">
                        <span className="text-emerald-500 mr-3 mt-1">✓</span>
                        <span className="text-gray-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Biblical Foundation */}
      <div className="bg-blue-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Rooted in Scripture</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg p-6 shadow">
                <blockquote className="text-lg italic text-gray-700 mb-4">
                  "Commit to the LORD whatever you do, and he will establish your plans."
                </blockquote>
                <cite className="text-blue-600 font-semibold">- Proverbs 16:3</cite>
              </div>
              <div className="bg-white rounded-lg p-6 shadow">
                <blockquote className="text-lg italic text-gray-700 mb-4">
                  "Let us hold unswervingly to the hope we profess, for he who promised is faithful."
                </blockquote>
                <cite className="text-blue-600 font-semibold">- Hebrews 10:23</cite>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accountability Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Accountability & Transparency</h2>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                We believe that commitments are meaningless without accountability. That's why we regularly evaluate 
                our progress, seek feedback from our community, and maintain transparency in all our operations.
              </p>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl mb-2">📊</div>
                  <h4 className="font-semibold text-gray-900 mb-2">Regular Reviews</h4>
                  <p className="text-sm text-gray-600">Annual assessment of our commitments and progress</p>
                </div>
                <div>
                  <div className="text-3xl mb-2">💬</div>
                  <h4 className="font-semibold text-gray-900 mb-2">Community Feedback</h4>
                  <p className="text-sm text-gray-600">Open dialogue with our congregation and community</p>
                </div>
                <div>
                  <div className="text-3xl mb-2">📝</div>
                  <h4 className="font-semibold text-gray-900 mb-2">Public Reporting</h4>
                  <p className="text-sm text-gray-600">Transparent sharing of our activities and impact</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Us in These Commitments</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            When you become part of Rehoboth Christian Church, you're not just joining a congregation—you're 
            joining a community committed to making a difference.
          </p>
          <div className="space-x-4">
            <a 
              href="/contact" 
              className="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Visit Us
            </a>
            <a 
              href="/get-involved/membership" 
              className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
            >
              Become a Member
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}