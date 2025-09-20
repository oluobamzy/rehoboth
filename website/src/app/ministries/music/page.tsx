// src/app/ministries/music/page.tsx
'use client';

import React from 'react';

export default function MusicMinistryPage() {
  const musicTeams = [
    {
      title: "Worship Team",
      description: "Lead the congregation in contemporary worship through vocals and instruments.",
      rehearsal: "Thursday 7:00 PM - 9:00 PM",
      service: "Sunday Morning & Evening",
      requirements: ["Heart for worship", "Musical skill (vocals/instruments)", "Regular commitment"],
      icon: "🎤"
    },
    {
      title: "Choir",
      description: "Traditional and contemporary choir performances for special services and events.",
      rehearsal: "Tuesday 6:30 PM - 8:00 PM",
      service: "Monthly Special Services",
      requirements: ["Ability to read music (preferred)", "Commitment to rehearsals", "Team spirit"],
      icon: "🎵"
    },
    {
      title: "Youth Band",
      description: "Young musicians leading worship for youth services and events.",
      rehearsal: "Saturday 3:00 PM - 4:30 PM",
      service: "Youth Services & Events",
      requirements: ["Ages 13-25", "Basic musical skills", "Heart for youth ministry"],
      icon: "🎸"
    },
    {
      title: "Children's Music",
      description: "Teaching children to worship through age-appropriate songs and instruments.",
      rehearsal: "Sunday 9:00 AM - 9:30 AM",
      service: "Children's Church",
      requirements: ["Love for children", "Basic musical ability", "Patience and creativity"],
      icon: "🎼"
    }
  ];

  const instruments = [
    "Piano/Keyboard", "Acoustic Guitar", "Electric Guitar", "Bass Guitar", 
    "Drums", "Violin/Strings", "Saxophone", "Trumpet", "Flute", "Other"
  ];

  const musicStyles = [
    {
      style: "Contemporary Worship",
      description: "Modern worship songs with contemporary instrumentation",
      examples: ["Hillsong", "Bethel Music", "Elevation Worship"]
    },
    {
      style: "Traditional Hymns",
      description: "Classic hymns with traditional arrangements",
      examples: ["Amazing Grace", "How Great Thou Art", "It Is Well"]
    },
    {
      style: "Gospel",
      description: "Soulful gospel music with rich harmonies",
      examples: ["Blessed Assurance", "Precious Lord", "Wade in the Water"]
    },
    {
      style: "Multicultural",
      description: "Songs from various cultures and languages",
      examples: ["African spirituals", "Latin worship", "Contemporary Christian"]
    }
  ];

  const opportunities = [
    {
      role: "Vocalist",
      description: "Lead or background vocals for worship teams",
      skills: "Good pitch, ability to harmonize, stage presence"
    },
    {
      role: "Instrumentalist",
      description: "Play various instruments during worship services",
      skills: "Proficiency in chosen instrument, ability to play by ear or read music"
    },
    {
      role: "Sound Technician",
      description: "Operate sound equipment during services",
      skills: "Technical aptitude, attention to detail, punctuality"
    },
    {
      role: "Music Director Assistant",
      description: "Help coordinate rehearsals and music preparation",
      skills: "Organizational skills, musical knowledge, leadership ability"
    },
    {
      role: "Song Leader",
      description: "Lead congregation in worship and praise",
      skills: "Strong voice, leadership presence, spiritual maturity"
    },
    {
      role: "Special Events Coordinator",
      description: "Organize musical performances for church events",
      skills: "Event planning, communication, creativity"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Music Ministry</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              Lifting hearts and voices to heaven through the beautiful gift of music and worship
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
              To create an atmosphere of authentic worship where hearts are drawn to God through music. 
              We believe music is a powerful tool for worship, evangelism, and spiritual growth, 
              and we seek to use our talents to glorify God and bless our community.
            </p>
            <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-500">
              <blockquote className="text-xl italic text-gray-700">
                "Sing to the LORD a new song; sing to the LORD, all the earth. Sing to the LORD, praise his name; 
                proclaim his salvation day after day."
              </blockquote>
              <cite className="text-purple-600 font-semibold mt-2 block">- Psalm 96:1-2</cite>
            </div>
          </div>
        </div>
      </div>

      {/* Music Teams */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Music Teams</h2>
            <div className="grid lg:grid-cols-2 gap-8">
              {musicTeams.map((team, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-4">{team.icon}</span>
                    <h3 className="text-xl font-bold text-gray-900">{team.title}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4">{team.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex">
                      <span className="font-medium text-purple-600 w-20">Rehearsal:</span>
                      <span className="text-gray-500">{team.rehearsal}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium text-purple-600 w-20">Service:</span>
                      <span className="text-gray-500">{team.service}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="font-medium text-gray-900 text-sm">Requirements:</span>
                    <ul className="mt-2 space-y-1">
                      {team.requirements.map((req, reqIndex) => (
                        <li key={reqIndex} className="text-sm text-gray-600 flex items-start">
                          <span className="text-purple-500 mr-2">•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Music Styles */}
      <div className="bg-pink-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Musical Styles</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {musicStyles.map((style, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{style.style}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{style.description}</p>
                  <div>
                    <span className="font-medium text-pink-600 text-sm">Examples:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {style.examples.map((example, exIndex) => (
                        <span key={exIndex} className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded">
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Instruments We Use */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Instruments We Welcome</h2>
            <div className="grid md:grid-cols-5 gap-4">
              {instruments.map((instrument, index) => (
                <div key={index} className="bg-purple-50 text-center p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">{instrument}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-600 mt-6">
              Don't see your instrument? We welcome musicians of all types and would love to explore how your musical gifts can be used in worship!
            </p>
          </div>
        </div>
      </div>

      {/* Opportunities */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Get Involved</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {opportunities.map((opportunity, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{opportunity.role}</h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{opportunity.description}</p>
                  <div className="text-xs text-purple-600">
                    <strong>Skills needed:</strong> {opportunity.skills}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Audition Process */}
      <div className="bg-purple-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Join Our Music Ministry</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Application Process</h3>
                <ol className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5">1</span>
                    Fill out music ministry application
                  </li>
                  <li className="flex items-start">
                    <span className="bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5">2</span>
                    Schedule an informal audition/meeting
                  </li>
                  <li className="flex items-start">
                    <span className="bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5">3</span>
                    Attend rehearsals as a participant
                  </li>
                  <li className="flex items-start">
                    <span className="bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5">4</span>
                    Begin serving on rotation schedule
                  </li>
                </ol>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">What We Look For</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-pink-500 mr-2">♪</span>
                    Heart for worship and ministry
                  </li>
                  <li className="flex items-start">
                    <span className="text-pink-500 mr-2">♪</span>
                    Commitment to excellence
                  </li>
                  <li className="flex items-start">
                    <span className="text-pink-500 mr-2">♪</span>
                    Teamwork and humility
                  </li>
                  <li className="flex items-start">
                    <span className="text-pink-500 mr-2">♪</span>
                    Regular attendance and reliability
                  </li>
                  <li className="flex items-start">
                    <span className="text-pink-500 mr-2">♪</span>
                    Willingness to grow and learn
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Use Your Musical Gifts</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Whether you're a seasoned musician or just beginning your musical journey, we invite you to use your gifts to worship God and bless others.
          </p>
          <div className="space-x-4">
            <a 
              href="/contact" 
              className="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Apply to Join
            </a>
            <a 
              href="/events" 
              className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
            >
              Attend a Service
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}