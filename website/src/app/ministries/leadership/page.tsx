// src/app/ministries/leadership/page.tsx
'use client';

import React from 'react';

export default function LeadershipMinistryPage() {
  const programs = [
    {
      title: "Leadership Development Program",
      duration: "6 months",
      description: "Comprehensive training covering biblical leadership principles, ministry skills, and practical application.",
      modules: [
        "Biblical Foundation of Leadership",
        "Character Development",
        "Vision and Strategy",
        "Team Building and Communication",
        "Conflict Resolution",
        "Ministry Planning and Execution"
      ]
    },
    {
      title: "Mentorship Program",
      duration: "12 months",
      description: "One-on-one mentoring relationships pairing emerging leaders with experienced ministry leaders.",
      benefits: [
        "Personal guidance and support",
        "Real-world ministry experience",
        "Accountability and growth",
        "Network building",
        "Spiritual development",
        "Leadership opportunities"
      ]
    },
    {
      title: "Ministry Internship",
      duration: "3-6 months",
      description: "Hands-on ministry experience working alongside senior leaders in various church departments.",
      areas: [
        "Pastoral Ministry",
        "Worship and Music",
        "Children and Youth",
        "Administration",
        "Outreach and Evangelism",
        "Teaching and Discipleship"
      ]
    }
  ];

  const leadershipPrinciples = [
    {
      title: "Servant Leadership",
      description: "Following Christ's example of leading through serving others with humility and love.",
      verse: "Whoever wants to become great among you must be your servant. - Mark 10:43",
      icon: "🤲"
    },
    {
      title: "Character Over Charisma",
      description: "Emphasizing integrity, faithfulness, and godly character as the foundation of leadership.",
      verse: "Above all else, guard your heart, for everything you do flows from it. - Proverbs 4:23",
      icon: "💎"
    },
    {
      title: "Empowering Others",
      description: "Developing and releasing others to use their gifts and reach their full potential in ministry.",
      verse: "And the things you have heard me say... entrust to reliable people who will also be qualified to teach others. - 2 Timothy 2:2",
      icon: "🌱"
    },
    {
      title: "Vision Casting",
      description: "Communicating God's vision clearly and inspiring others to join in fulfilling it.",
      verse: "Where there is no revelation, people cast off restraint. - Proverbs 29:18",
      icon: "🎯"
    },
    {
      title: "Team Building",
      description: "Creating unity and synergy among diverse team members for maximum kingdom impact.",
      verse: "Just as a body, though one, has many parts... so it is with Christ. - 1 Corinthians 12:12",
      icon: "🤝"
    },
    {
      title: "Continuous Learning",
      description: "Committing to lifelong growth, learning, and adaptation in leadership skills and spiritual maturity.",
      verse: "Let the wise listen and add to their learning. - Proverbs 1:5",
      icon: "📚"
    }
  ];

  const leadershipLevels = [
    {
      level: "Emerging Leaders",
      description: "New to leadership roles",
      focus: "Foundation building and basic skills",
      activities: ["Leadership basics workshop", "Character development", "Ministry observation", "Basic responsibilities"]
    },
    {
      level: "Developing Leaders",
      description: "Some leadership experience",
      focus: "Skill enhancement and ministry involvement",
      activities: ["Advanced training modules", "Team leadership roles", "Project management", "Mentoring newer leaders"]
    },
    {
      level: "Established Leaders",
      description: "Experienced in ministry leadership",
      focus: "Vision casting and strategic leadership",
      activities: ["Strategic planning", "Department leadership", "Mentoring programs", "Church-wide initiatives"]
    },
    {
      level: "Senior Leaders",
      description: "Mature leaders ready for greater responsibility",
      focus: "Multiplication and legacy building",
      activities: ["Leadership development oversight", "Cross-ministry collaboration", "Succession planning", "External ministry partnerships"]
    }
  ];

  const opportunities = [
    {
      title: "Small Group Leadership",
      description: "Lead a small group Bible study or life group",
      commitment: "Weekly meetings + preparation time"
    },
    {
      title: "Ministry Team Leadership",
      description: "Oversee a specific ministry area or team",
      commitment: "Monthly planning + weekly involvement"
    },
    {
      title: "Teaching Ministry",
      description: "Teach Sunday school, lead Bible studies, or guest preach",
      commitment: "Based on availability and calling"
    },
    {
      title: "Event Coordination",
      description: "Plan and execute church events and special programs",
      commitment: "Project-based involvement"
    },
    {
      title: "Discipleship Mentoring",
      description: "Mentor new believers or emerging leaders",
      commitment: "Regular one-on-one meetings"
    },
    {
      title: "Community Outreach Leadership",
      description: "Lead community service and evangelism initiatives",
      commitment: "Monthly outreach activities"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Leadership Ministry</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              Developing Christ-centered leaders who multiply disciples and transform communities
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
              To identify, develop, and deploy Christ-centered leaders who will advance God's kingdom through the local church 
              and beyond. We believe leadership is not about position but about influence, and every believer has the potential 
              to lead in some capacity.
            </p>
            <div className="bg-indigo-50 rounded-lg p-6 border-l-4 border-indigo-500">
              <blockquote className="text-xl italic text-gray-700">
                "And the things you have heard me say in the presence of many witnesses entrust to reliable people 
                who will also be qualified to teach others."
              </blockquote>
              <cite className="text-indigo-600 font-semibold mt-2 block">- 2 Timothy 2:2</cite>
            </div>
          </div>
        </div>
      </div>

      {/* Leadership Programs */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Leadership Development Programs</h2>
            <div className="space-y-8">
              {programs.map((program, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-8 shadow-lg">
                  <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <div className="flex items-center mb-4">
                        <h3 className="text-2xl font-bold text-gray-900">{program.title}</h3>
                        <span className="ml-4 bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full">
                          {program.duration}
                        </span>
                      </div>
                      <p className="text-gray-600 leading-relaxed mb-6">{program.description}</p>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        {program.modules ? 'Modules' : program.benefits ? 'Benefits' : 'Areas'}
                      </h4>
                      <ul className="space-y-2 text-sm">
                        {(program.modules || program.benefits || program.areas)?.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start">
                            <span className="text-indigo-500 mr-2">•</span>
                            <span className="text-gray-600">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Leadership Principles */}
      <div className="bg-purple-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Biblical Leadership Principles</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {leadershipPrinciples.map((principle, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow text-center">
                  <div className="text-4xl mb-4">{principle.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{principle.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{principle.description}</p>
                  <div className="bg-purple-50 p-3 rounded border-l-4 border-purple-500">
                    <p className="text-xs italic text-gray-700">{principle.verse}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Leadership Levels */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Leadership Development Path</h2>
            <div className="grid lg:grid-cols-2 gap-8">
              {leadershipLevels.map((level, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 shadow">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{level.level}</h3>
                  <p className="text-indigo-600 font-medium mb-3">{level.description}</p>
                  <p className="text-gray-600 mb-4">{level.focus}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {level.activities.map((activity, actIndex) => (
                      <div key={actIndex} className="flex items-center text-sm text-gray-500">
                        <span className="text-purple-500 mr-2">✓</span>
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

      {/* Leadership Opportunities */}
      <div className="bg-indigo-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Leadership Opportunities</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {opportunities.map((opportunity, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{opportunity.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{opportunity.description}</p>
                  <p className="text-indigo-600 font-medium text-sm">{opportunity.commitment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Application Process */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Join Our Leadership Development</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Active member of Rehoboth Christian Church
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Demonstrated faithfulness in current responsibilities
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Heart for ministry and serving others
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Willingness to learn and grow
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Commitment to complete the program
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Application Process</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2">1.</span>
                    Submit leadership application form
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2">2.</span>
                    Meet with leadership team for interview
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2">3.</span>
                    Complete spiritual gifts assessment
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2">4.</span>
                    Begin appropriate development program
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2">5.</span>
                    Start leadership role with mentoring
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Step Into Your Leadership Calling</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            God has placed leadership potential within you. Join us in developing that potential for His glory 
            and the advancement of His kingdom.
          </p>
          <div className="space-x-4">
            <a 
              href="/contact" 
              className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Apply Now
            </a>
            <a 
              href="/get-involved/volunteering" 
              className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
            >
              Start Volunteering
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}