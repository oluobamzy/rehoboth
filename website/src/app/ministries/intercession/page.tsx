// src/app/ministries/intercession/page.tsx
'use client';

import React from 'react';

export default function IntercessionMinistryPage() {
  const prayerFocusAreas = [
    {
      title: "Church & Leadership",
      description: "Praying for our pastoral team, church leadership, and the overall direction of our congregation.",
      icon: "⛪"
    },
    {
      title: "Community & Nation",
      description: "Interceding for our local community, city, province, and nation for God's will to be done.",
      icon: "🏛️"
    },
    {
      title: "Missions & Evangelism",
      description: "Supporting missionaries and evangelism efforts through dedicated prayer and spiritual warfare.",
      icon: "🌍"
    },
    {
      title: "Healing & Restoration",
      description: "Praying for physical, emotional, and spiritual healing for individuals and families.",
      icon: "🙏"
    },
    {
      title: "Revival & Awakening",
      description: "Seeking God for spiritual revival in our church, community, and around the world.",
      icon: "🔥"
    },
    {
      title: "Personal Requests",
      description: "Lifting up individual prayer requests from our congregation and community.",
      icon: "💝"
    }
  ];

  const prayerMeetings = [
    {
      title: "Corporate Prayer",
      time: "Wednesday 7:00 PM - 8:00 PM",
      description: "Weekly church-wide prayer meeting focusing on various ministry needs and community concerns."
    },
    {
      title: "Early Morning Prayer",
      time: "Saturday 6:00 AM - 7:00 AM",
      description: "Start your weekend with passionate prayer and seeking God's face for the day ahead."
    },
    {
      title: "Intercessors Circle",
      time: "Monthly - First Friday 7:00 PM",
      description: "Dedicated prayer warriors gathering for intensive intercession and spiritual warfare."
    },
    {
      title: "Youth Prayer",
      time: "Sunday 2:00 PM - 3:00 PM",
      description: "Young people coming together to pray for their generation and youth-related concerns."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Intercession Ministry</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              Standing in the gap through powerful prayer, seeking God's will and intervention in every situation
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
              To create a house of prayer where believers come together to intercede for our church, community, 
              and world. We believe in the power of prayer to change circumstances, transform lives, and advance God's kingdom.
            </p>
            <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
              <blockquote className="text-xl italic text-gray-700">
                "If my people, who are called by my name, will humble themselves and pray and seek my face 
                and turn from their wicked ways, then I will hear from heaven, and I will forgive their sin and will heal their land."
              </blockquote>
              <cite className="text-blue-600 font-semibold mt-2 block">- 2 Chronicles 7:14</cite>
            </div>
          </div>
        </div>
      </div>

      {/* Prayer Focus Areas */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Prayer Focus Areas</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {prayerFocusAreas.map((area, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 text-center shadow hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4">{area.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{area.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{area.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Prayer Meetings */}
      <div className="bg-blue-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Prayer Meetings</h2>
            <div className="grid lg:grid-cols-2 gap-8">
              {prayerMeetings.map((meeting, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{meeting.title}</h3>
                  <p className="text-blue-600 font-medium mb-3">{meeting.time}</p>
                  <p className="text-gray-600 leading-relaxed">{meeting.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Prayer Ministry</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Whether you're a seasoned prayer warrior or just beginning your prayer journey, there's a place for you in our intercession ministry.
          </p>
          <div className="space-x-4">
            <a 
              href="/contact" 
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Join Us
            </a>
            <a 
              href="/get-involved/prayer-request" 
              className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Submit Prayer Request
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}