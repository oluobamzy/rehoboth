// src/app/about/leadership/page.tsx
'use client';

import React from 'react';
import Image from 'next/image';

export default function LeadershipPage() {
  const leaders = [
    {
      name: "Pastor Patrick Awunor",
      title: "Senior Pastor",
      image: "/PastorPatrick&wife.jpg", // Using the image from the workspace
      bio: "Pastor Patrick leads our church with passion, wisdom, and unwavering dedication to God's word. With over [X] years of ministry experience, he brings deep theological knowledge and a heart for shepherding God's people.",
      education: [
        "Master of Divinity, [Seminary Name]",
        "Bachelor of Theology, [University Name]"
      ],
      specialties: ["Expository Preaching", "Church Leadership", "Pastoral Care", "Evangelism"],
      contact: {
        email: "pastor@rehobothchurch.ca",
        phone: "613-400-4966"
      }
    },
    // Add more leaders as needed
  ];

  const ministryLeaders = [
    {
      title: "Women's Ministry Leader",
      name: "Sister [Name]",
      description: "Leading and empowering women in their spiritual journey and community service."
    },
    {
      title: "Children's Ministry Leader", 
      name: "Brother/Sister [Name]",
      description: "Nurturing the next generation through engaging programs and biblical teaching."
    },
    {
      title: "Youth Ministry Leader",
      name: "Brother/Sister [Name]", 
      description: "Mentoring young people and helping them develop strong foundations in faith."
    },
    {
      title: "Music Ministry Leader",
      name: "Brother/Sister [Name]",
      description: "Leading worship and praise through music that honors God and inspires the congregation."
    },
    {
      title: "Evangelization Ministry Leader",
      name: "Brother/Sister [Name]",
      description: "Coordinating outreach efforts and spreading the Gospel in our community."
    },
    {
      title: "Community Support Ministry Leader",
      name: "Brother/Sister [Name]",
      description: "Organizing community service initiatives and support programs for those in need."
    }
  ];

  const boardMembers = [
    {
      name: "[Board Member Name]",
      title: "Board Chairman",
      role: "Provides strategic oversight and governance leadership"
    },
    {
      name: "[Board Member Name]",
      title: "Board Secretary", 
      role: "Maintains records and ensures proper documentation"
    },
    {
      name: "[Board Member Name]",
      title: "Board Treasurer",
      role: "Oversees financial stewardship and accountability"
    },
    {
      name: "[Board Member Name]",
      title: "Board Member",
      role: "Contributes to strategic planning and church governance"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Leadership</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              Meet the dedicated leaders who guide our church family with wisdom, love, and devotion to God's calling
            </p>
          </div>
        </div>
      </div>

      {/* Senior Pastor Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Senior Pastor</h2>
            {leaders.map((leader, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <div className="relative h-80 md:h-full">
                      <Image
                        src={leader.image}
                        alt={leader.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="md:w-2/3 p-8">
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{leader.name}</h3>
                    <p className="text-xl text-indigo-600 mb-6">{leader.title}</p>
                    <p className="text-gray-600 leading-relaxed mb-6">{leader.bio}</p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Education</h4>
                        <ul className="space-y-2">
                          {leader.education.map((edu, eduIndex) => (
                            <li key={eduIndex} className="text-gray-600 text-sm">• {edu}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Specialties</h4>
                        <ul className="space-y-2">
                          {leader.specialties.map((specialty, specIndex) => (
                            <li key={specIndex} className="text-gray-600 text-sm">• {specialty}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex flex-wrap gap-4">
                        <a 
                          href={`mailto:${leader.contact.email}`}
                          className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
                        >
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                          </svg>
                          {leader.contact.email}
                        </a>
                        <a 
                          href={`tel:${leader.contact.phone}`}
                          className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
                        >
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                          </svg>
                          {leader.contact.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ministry Leaders Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Ministry Leaders</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ministryLeaders.map((leader, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 shadow hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{leader.title}</h3>
                  <p className="text-indigo-600 font-medium mb-3">{leader.name}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{leader.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Board Members Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Board of Directors</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {boardMembers.map((member, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-indigo-600 font-medium mb-3">{member.title}</p>
                  <p className="text-gray-600 text-sm">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Leadership Philosophy */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Leadership Philosophy</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-indigo-50 rounded-lg p-6">
                <div className="text-4xl mb-4">🤲</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Servant Leadership</h3>
                <p className="text-gray-600 text-sm">
                  Following Christ's example, our leaders serve the congregation with humility and love.
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-6">
                <div className="text-4xl mb-4">📖</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Biblical Foundation</h3>
                <p className="text-gray-600 text-sm">
                  All leadership decisions are grounded in Scripture and guided by prayer.
                </p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-6">
                <div className="text-4xl mb-4">🌱</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Empowerment</h3>
                <p className="text-gray-600 text-sm">
                  We believe in developing and empowering others to use their gifts in ministry.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Leadership */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Connect with Our Leadership</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Our leaders are here to serve you. Don't hesitate to reach out with questions, prayer requests, or to schedule a meeting.
          </p>
          <div className="space-x-4">
            <a 
              href="/contact" 
              className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Contact Us
            </a>
            <a 
              href="/get-involved/prayer-request" 
              className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
            >
              Prayer Request
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}