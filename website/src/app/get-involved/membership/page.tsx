// src/app/get-involved/membership/page.tsx
'use client';

import React from 'react';

export default function MembershipPage() {
  const membershipBenefits = [
    {
      title: "Spiritual Growth",
      description: "Access to discipleship programs, mentoring, and spiritual development opportunities.",
      icon: "🌱"
    },
    {
      title: "Community Connection",
      description: "Build meaningful relationships with fellow believers and participate in church family activities.",
      icon: "🤝"
    },
    {
      title: "Ministry Opportunities",
      description: "Serve in various ministries and use your gifts to make a difference in the kingdom.",
      icon: "⚡"
    },
    {
      title: "Leadership Development",
      description: "Access to leadership training programs and opportunities to grow in influence.",
      icon: "👑"
    },
    {
      title: "Pastoral Care",
      description: "Receive pastoral support during life's challenges and celebrations.",
      icon: "🤲"
    },
    {
      title: "Church Governance",
      description: "Participate in church decisions and have a voice in the direction of our ministry.",
      icon: "🗳️"
    }
  ];

  const membershipProcess = [
    {
      step: 1,
      title: "Attend Membership Class",
      description: "Join our monthly membership class to learn about our church's vision, mission, and values.",
      duration: "2-hour session"
    },
    {
      step: 2,
      title: "Meet with Pastor",
      description: "Have a personal conversation with one of our pastors about your faith journey and commitment.",
      duration: "30-45 minutes"
    },
    {
      step: 3,
      title: "Complete Application",
      description: "Fill out our membership application form with your personal information and testimony.",
      duration: "15-20 minutes"
    },
    {
      step: 4,
      title: "Public Declaration",
      description: "Make a public commitment during a church service to join our church family.",
      duration: "During service"
    }
  ];

  const expectations = [
    {
      category: "Faith Commitment",
      items: [
        "Personal relationship with Jesus Christ",
        "Commitment to Christian growth and discipleship",
        "Desire to live according to biblical principles",
        "Willingness to be baptized (if not already)"
      ]
    },
    {
      category: "Church Involvement",
      items: [
        "Regular attendance at worship services",
        "Participation in church activities and programs",
        "Active involvement in a ministry or service area",
        "Support of church mission and vision"
      ]
    },
    {
      category: "Community Life",
      items: [
        "Commitment to loving and serving fellow members",
        "Participation in small groups or fellowship activities",
        "Willingness to resolve conflicts in a biblical manner",
        "Support and encouragement of church leadership"
      ]
    },
    {
      category: "Financial Stewardship",
      items: [
        "Regular giving as an act of worship",
        "Understanding of biblical principles of stewardship",
        "Support of church ministries and missions",
        "Commitment to faithful tithing and offerings"
      ]
    }
  ];

  const faqs = [
    {
      question: "Do I have to be baptized to become a member?",
      answer: "While we encourage baptism as an important step of faith, we welcome discussions about this during your pastoral meeting. We'll help you understand the significance of baptism and support you in this decision."
    },
    {
      question: "What if I'm new to the Christian faith?",
      answer: "We welcome new believers! Our membership process includes support for those growing in their faith. We have discipleship programs and mentoring available to help you in your spiritual journey."
    },
    {
      question: "Is there an age requirement for membership?",
      answer: "We welcome members of all ages who can make a personal commitment to Christ and the church. For younger individuals, we may involve parents in the process and provide age-appropriate guidance."
    },
    {
      question: "What are the financial commitments?",
      answer: "We encourage biblical giving as an act of worship, but we don't set specific amounts. We believe in cheerful, sacrificial giving as God leads your heart. We'll provide teaching on biblical stewardship to help guide your decisions."
    },
    {
      question: "Can I serve in ministry before becoming a member?",
      answer: "Yes! We encourage everyone to get involved in serving. Some leadership positions may require membership, but there are many ways to serve and contribute while you're going through the membership process."
    },
    {
      question: "What if I need to transfer my membership from another church?",
      answer: "We welcome transfers from other churches. During your pastoral meeting, we'll discuss your previous church experience and help facilitate any necessary communications with your former church."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Church Membership</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              Join our church family and become part of something bigger than yourself
            </p>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Welcome to Our Family</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Church membership is more than just joining an organization—it's about becoming part of a family, 
              committing to a community, and participating in God's mission together. We believe that membership 
              provides a foundation for spiritual growth, meaningful relationships, and purposeful service.
            </p>
            <div className="bg-emerald-50 rounded-lg p-6 border-l-4 border-emerald-500">
              <blockquote className="text-xl italic text-gray-700">
                "So in Christ we, though many, form one body, and each member belongs to all the others."
              </blockquote>
              <cite className="text-emerald-600 font-semibold mt-2 block">- Romans 12:5</cite>
            </div>
          </div>
        </div>
      </div>

      {/* Membership Benefits */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Benefits of Membership</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {membershipBenefits.map((benefit, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 text-center shadow hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Membership Process */}
      <div className="bg-emerald-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How to Become a Member</h2>
            <div className="space-y-6">
              {membershipProcess.map((step, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow flex items-start">
                  <div className="bg-emerald-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg mr-6 flex-shrink-0">
                    {step.step}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 mb-2 leading-relaxed">{step.description}</p>
                    <span className="text-sm text-emerald-600 font-medium">{step.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Membership Expectations */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Membership Expectations</h2>
            <div className="grid lg:grid-cols-2 gap-8">
              {expectations.map((expectation, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 shadow">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{expectation.category}</h3>
                  <ul className="space-y-2">
                    {expectation.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start text-gray-600">
                        <span className="text-emerald-500 mr-2 mt-1">✓</span>
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Ready to Take the Next Step?</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              We're excited about the possibility of you joining our church family! Our next membership class 
              is coming up, and we'd love to have you participate.
            </p>
            <div className="bg-emerald-50 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Next Membership Class</h3>
              <p className="text-gray-600 mb-2"><strong>Date:</strong> [First Saturday of each month]</p>
              <p className="text-gray-600 mb-2"><strong>Time:</strong> 10:00 AM - 12:00 PM</p>
              <p className="text-gray-600 mb-4"><strong>Location:</strong> Church Fellowship Hall</p>
              <p className="text-sm text-gray-500">Light refreshments will be provided</p>
            </div>
            <div className="space-x-4">
              <a 
                href="/contact" 
                className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
              >
                Register for Class
              </a>
              <a 
                href="/contact" 
                className="inline-block border-2 border-emerald-600 text-emerald-600 px-8 py-3 rounded-lg font-semibold hover:bg-emerald-600 hover:text-white transition-colors"
              >
                Ask Questions
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Your Church Family Awaits</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            God has brought you to this place for a reason. We believe He's calling you to be part of our church family. 
            Take the next step and discover the joy of belonging.
          </p>
          <a 
            href="/contact" 
            className="inline-block bg-white text-emerald-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Start Your Membership Journey
          </a>
        </div>
      </div>
    </div>
  );
}