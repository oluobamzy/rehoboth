// src/app/ministries/evangelization/page.tsx
'use client';

import React from 'react';

export default function EvangelizationMinistryPage() {
  const initiatives = [
    {
      title: "Community Outreach",
      description: "Regular visits to neighborhoods, parks, and public spaces to share the Gospel and serve others.",
      activities: ["Door-to-door ministry", "Park evangelism", "Street ministry", "Community events"],
      frequency: "Weekly",
      icon: "🏘️"
    },
    {
      title: "Prison Ministry",
      description: "Bringing hope and salvation to incarcerated individuals through visits and Bible studies.",
      activities: ["Prison visits", "Bible studies", "Mentorship programs", "Reentry support"],
      frequency: "Monthly",
      icon: "🔓"
    },
    {
      title: "Hospital & Nursing Home Ministry",
      description: "Caring for the sick and elderly by sharing God's love and providing spiritual support.",
      activities: ["Hospital visits", "Prayer ministry", "Comfort visits", "Spiritual counseling"],
      frequency: "Weekly",
      icon: "🏥"
    },
    {
      title: "International Missions",
      description: "Supporting global missions through partnerships, funding, and mission trips.",
      activities: ["Mission trips", "Missionary support", "Global partnerships", "Fundraising"],
      frequency: "Ongoing",
      icon: "🌍"
    },
    {
      title: "Digital Evangelism",
      description: "Using technology and social media to reach people with the Gospel message.",
      activities: ["Online ministry", "Social media outreach", "Digital content", "Virtual events"],
      frequency: "Daily",
      icon: "💻"
    },
    {
      title: "Special Events",
      description: "Organizing community events that create opportunities to share Christ's love.",
      activities: ["Community festivals", "Free food drives", "Health fairs", "Holiday events"],
      frequency: "Seasonal",
      icon: "🎉"
    }
  ];

  const principles = [
    {
      title: "Love-Centered Approach",
      description: "We share the Gospel through acts of love and genuine care for others.",
      verse: "By this everyone will know that you are my disciples, if you love one another. - John 13:35"
    },
    {
      title: "Spirit-Led Ministry",
      description: "We depend on the Holy Spirit to guide our efforts and open hearts to the Gospel.",
      verse: "But you will receive power when the Holy Spirit comes on you; and you will be my witnesses. - Acts 1:8"
    },
    {
      title: "Culturally Sensitive",
      description: "We respect and honor different cultures while sharing the universal message of Christ.",
      verse: "I have become all things to all people so that by all possible means I might save some. - 1 Corinthians 9:22"
    },
    {
      title: "Relationship-Focused",
      description: "We build genuine relationships as the foundation for sharing our faith.",
      verse: "We loved you so much that we were delighted to share with you not only the gospel of God but our lives as well. - 1 Thessalonians 2:8"
    }
  ];

  const getInvolvedOptions = [
    {
      title: "Prayer Warriors",
      description: "Intercede for our evangelism efforts and the people we encounter.",
      commitment: "Ongoing prayer support"
    },
    {
      title: "Evangelism Team",
      description: "Join us in outreach activities and sharing the Gospel directly.",
      commitment: "Weekly/Monthly participation"
    },
    {
      title: "Support Team",
      description: "Help with logistics, planning, and behind-the-scenes ministry support.",
      commitment: "Flexible involvement"
    },
    {
      title: "Training Program",
      description: "Learn effective evangelism techniques and biblical approaches to sharing faith.",
      commitment: "Monthly training sessions"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Evangelization Ministry</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              Sharing the hope of Jesus Christ with our community and the world through love, service, and the power of the Gospel
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
              To fulfill the Great Commission by actively sharing the Gospel of Jesus Christ in our local community 
              and around the world. We believe every person deserves to hear the good news of salvation and experience 
              the transforming love of God.
            </p>
            <div className="bg-red-50 rounded-lg p-6 border-l-4 border-red-500">
              <blockquote className="text-xl italic text-gray-700">
                "Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son 
                and of the Holy Spirit, and teaching them to obey everything I have commanded you."
              </blockquote>
              <cite className="text-red-600 font-semibold mt-2 block">- Matthew 28:19-20</cite>
            </div>
          </div>
        </div>
      </div>

      {/* Ministry Initiatives */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Ministry Initiatives</h2>
            <div className="grid lg:grid-cols-2 gap-8">
              {initiatives.map((initiative, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-4">{initiative.icon}</span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{initiative.title}</h3>
                      <span className="text-red-600 font-medium text-sm">{initiative.frequency}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4">{initiative.description}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {initiative.activities.map((activity, actIndex) => (
                      <div key={actIndex} className="flex items-center text-sm text-gray-500">
                        <span className="text-red-500 mr-2">•</span>
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

      {/* Ministry Principles */}
      <div className="bg-orange-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Ministry Principles</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {principles.map((principle, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{principle.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">{principle.description}</p>
                  <div className="bg-orange-50 p-4 rounded border-l-4 border-orange-500">
                    <p className="text-sm italic text-gray-700">{principle.verse}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Impact & Testimony */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">God's Faithfulness</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              We have witnessed God's incredible faithfulness through our evangelism ministry. Lives have been transformed, 
              families restored, and communities impacted by the power of the Gospel.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-red-50 p-6 rounded-lg">
                <div className="text-3xl font-bold text-red-600 mb-2">[#]+</div>
                <p className="text-gray-700 font-semibold">Souls Reached</p>
                <p className="text-sm text-gray-600">Through our various outreach efforts</p>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg">
                <div className="text-3xl font-bold text-orange-600 mb-2">[#]+</div>
                <p className="text-gray-700 font-semibold">Baptisms</p>
                <p className="text-sm text-gray-600">New believers following Christ</p>
              </div>
              <div className="bg-yellow-50 p-6 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600 mb-2">[#]+</div>
                <p className="text-gray-700 font-semibold">Mission Trips</p>
                <p className="text-sm text-gray-600">International Gospel missions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Get Involved Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Get Involved</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {getInvolvedOptions.map((option, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{option.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{option.description}</p>
                  <p className="text-red-600 font-medium text-sm">{option.commitment}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <p className="text-lg text-gray-600 mb-6">
                Ready to be part of God's harvest? Whether you're experienced in evangelism or just starting your journey, 
                there's a place for you in this vital ministry.
              </p>
              <a 
                href="/get-involved/volunteering" 
                className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Join Our Ministry
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Training & Resources */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Training & Resources</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Evangelism Training</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Personal evangelism techniques
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Cross-cultural ministry skills
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Apologetics and answering questions
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Leading someone to Christ
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Resources Available</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">•</span>
                    Gospel tracts and materials
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">•</span>
                    Bible study guides
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">•</span>
                    Translation services
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">•</span>
                    Ministry tools and supplies
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">The Harvest is Ready</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join us in reaching the lost and making disciples. Together, we can see our community transformed by the Gospel of Jesus Christ.
          </p>
          <div className="space-x-4">
            <a 
              href="/contact" 
              className="inline-block bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Learn More
            </a>
            <a 
              href="/get-involved/prayer-request" 
              className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-colors"
            >
              Request Prayer
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}