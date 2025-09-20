// src/app/ministries/youth/page.tsx
'use client';

import React from 'react';

export default function YouthMinistryPage() {
  const programs = [
    {
      title: "Youth Group",
      ageGroup: "Ages 13-18",
      time: "Friday 7:00 PM - 9:00 PM",
      description: "Weekly gatherings featuring worship, Bible study, games, and fellowship for teenagers.",
      activities: ["Interactive Bible Studies", "Worship & Prayer", "Group Games", "Life Discussions"]
    },
    {
      title: "Youth Bible Study",
      ageGroup: "Ages 13-18",
      time: "Wednesday 6:30 PM - 7:30 PM",
      description: "Deep dive into God's Word with discussions relevant to teen life and challenges.",
      activities: ["Scripture Study", "Life Application", "Group Discussion", "Prayer Time"]
    },
    {
      title: "Youth Leadership Program",
      ageGroup: "Ages 16-18",
      time: "Monthly Saturdays",
      description: "Developing the next generation of Christian leaders through training and mentorship.",
      activities: ["Leadership Skills", "Ministry Training", "Mentorship", "Service Projects"]
    },
    {
      title: "Summer Youth Camp",
      ageGroup: "Ages 13-18",
      time: "Annual Summer Event",
      description: "Week-long retreat focusing on spiritual growth, adventure, and lifelong friendships.",
      activities: ["Outdoor Adventures", "Worship Sessions", "Team Building", "Spiritual Growth"]
    }
  ];

  const topics = [
    "Identity in Christ",
    "Relationships & Dating",
    "Social Media & Technology",
    "Peer Pressure & Decision Making",
    "Future Planning & Purpose",
    "Mental Health & Wellness",
    "Social Justice & Service",
    "Faith Questions & Doubts"
  ];

  const leaders = [
    {
      name: "Youth Pastor [Name]",
      role: "Youth Ministry Leader",
      description: "Passionate about walking alongside teens in their faith journey"
    },
    {
      name: "[Volunteer Name]",
      role: "Youth Mentor",
      description: "Dedicated to supporting youth through life's challenges and victories"
    },
    {
      name: "[Volunteer Name]",
      role: "Worship Leader",
      description: "Leading youth in authentic worship and musical expression"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Youth Ministry</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              Empowering the next generation to live boldly for Christ in an ever-changing world
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
              To create a community where teenagers can encounter Jesus Christ, grow in their faith, 
              and develop into confident Christian leaders who impact their schools, families, and communities. 
              We believe every teen has incredible potential to change the world.
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

      {/* Programs Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Programs</h2>
            <div className="grid lg:grid-cols-2 gap-8">
              {programs.map((program, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{program.title}</h3>
                    <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
                      {program.ageGroup}
                    </span>
                  </div>
                  <p className="text-blue-600 font-medium mb-3">{program.time}</p>
                  <p className="text-gray-600 leading-relaxed mb-4">{program.description}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {program.activities.map((activity, actIndex) => (
                      <div key={actIndex} className="flex items-center text-sm text-gray-500">
                        <span className="text-purple-500 mr-2">•</span>
                        {activity}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Topics We Cover */}
      <div className="bg-purple-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Real Topics, Real Faith</h2>
            <p className="text-lg text-gray-600 mb-8 text-center leading-relaxed">
              We tackle the questions and challenges that teenagers face today, addressing them with biblical wisdom and practical application.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {topics.map((topic, index) => (
                <div key={index} className="bg-white rounded-lg p-4 shadow text-center">
                  <p className="text-gray-700 font-medium">{topic}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Leadership Team */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Leadership Team</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {leaders.map((leader, index) => (
                <div key={index} className="text-center bg-gray-50 rounded-lg p-6">
                  <div className="w-20 h-20 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">👤</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{leader.name}</h3>
                  <p className="text-purple-600 font-medium mb-3">{leader.role}</p>
                  <p className="text-gray-600 text-sm">{leader.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

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