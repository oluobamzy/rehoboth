// src/app/ministries/community-support/page.tsx
'use client';

import React from 'react';

export default function CommunitySupportMinistryPage() {
  const programs = [
    {
      title: "Food Bank",
      description: "Providing nutritious food assistance to families and individuals in need within our community.",
      schedule: "Monthly distribution",
      beneficiaries: "Families in need",
      icon: "🍞"
    },
    {
      title: "Clothing Drives",
      description: "Collecting and distributing clothing for all ages, especially during seasonal transitions.",
      schedule: "Quarterly events",
      beneficiaries: "All community members",
      icon: "👕"
    },
    {
      title: "Emergency Assistance",
      description: "Providing immediate help for urgent needs such as utilities, rent, or medical expenses.",
      schedule: "As needed",
      beneficiaries: "Emergency situations",
      icon: "🆘"
    },
    {
      title: "Senior Support",
      description: "Offering companionship, transportation, and practical assistance to elderly community members.",
      schedule: "Weekly visits",
      beneficiaries: "Seniors in community",
      icon: "👴"
    },
    {
      title: "Single Parent Support",
      description: "Providing childcare, mentorship, and practical resources for single parents.",
      schedule: "Bi-weekly meetings",
      beneficiaries: "Single parent families",
      icon: "👨‍👧‍👦"
    },
    {
      title: "Job Training & Skills",
      description: "Offering workshops and training programs to help community members develop employment skills.",
      schedule: "Monthly workshops",
      beneficiaries: "Job seekers",
      icon: "💼"
    }
  ];

  const volunteerRoles = [
    {
      role: "Food Bank Coordinator",
      description: "Organize food collection, sorting, and distribution events",
      commitment: "4-6 hours monthly"
    },
    {
      role: "Visitation Team",
      description: "Visit elderly or homebound community members",
      commitment: "2-3 hours weekly"
    },
    {
      role: "Transportation Assistant",
      description: "Provide rides to appointments or grocery shopping",
      commitment: "Flexible schedule"
    },
    {
      role: "Event Organizer",
      description: "Plan and coordinate community support events",
      commitment: "Project-based"
    },
    {
      role: "Resource Coordinator",
      description: "Connect people with needed services and resources",
      commitment: "5-10 hours weekly"
    },
    {
      role: "Administrative Support",
      description: "Help with paperwork, scheduling, and organization",
      commitment: "2-4 hours weekly"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Community Support Ministry</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              Demonstrating Christ's love through practical care and support for our neighbors in need
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
              To be the hands and feet of Jesus in our community by providing practical support, resources, 
              and care to those facing various challenges. We believe that meeting physical needs opens doors 
              to share spiritual hope and demonstrate God's love in tangible ways.
            </p>
            <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
              <blockquote className="text-xl italic text-gray-700">
                "Religion that God our Father accepts as pure and faultless is this: to look after orphans 
                and widows in their distress and to keep oneself from being polluted by the world."
              </blockquote>
              <cite className="text-green-600 font-semibold mt-2 block">- James 1:27</cite>
            </div>
          </div>
        </div>
      </div>

      {/* Support Programs */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Support Programs</h2>
            <div className="grid lg:grid-cols-2 gap-8">
              {programs.map((program, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-4">{program.icon}</span>
                    <h3 className="text-xl font-bold text-gray-900">{program.title}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4">{program.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-green-600">Schedule:</span>
                      <p className="text-gray-500">{program.schedule}</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-600">Serves:</span>
                      <p className="text-gray-500">{program.beneficiaries}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How to Get Help */}
      <div className="bg-emerald-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How to Receive Support</h2>
            <div className="bg-white rounded-lg p-8 shadow">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      Call the church office during business hours
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      Speak with a pastor or ministry leader
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      Fill out a support request form
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      Visit us during designated support hours
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">What to Expect</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <span className="text-emerald-500 mr-2">•</span>
                      Confidential conversation about your needs
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-500 mr-2">•</span>
                      Assessment of available resources
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-500 mr-2">•</span>
                      Connection with appropriate programs
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-500 mr-2">•</span>
                      Ongoing support and follow-up
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Volunteer Opportunities */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Volunteer Opportunities</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {volunteerRoles.map((role, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{role.role}</h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{role.description}</p>
                  <p className="text-green-600 font-medium text-sm">{role.commitment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Impact Section */}
      <div className="bg-green-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Impact</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-3xl font-bold text-green-600 mb-2">150+</div>
                <p className="text-gray-700 font-semibold">Families Served</p>
                <p className="text-sm text-gray-600">Monthly through our programs</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-3xl font-bold text-emerald-600 mb-2">500+</div>
                <p className="text-gray-700 font-semibold">Meals Provided</p>
                <p className="text-sm text-gray-600">Through food bank ministry</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-3xl font-bold text-green-600 mb-2">2000+</div>
                <p className="text-gray-700 font-semibold">Volunteer Hours</p>
                <p className="text-sm text-gray-600">Dedicated annually</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Get Involved in Community Support</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Whether you need support or want to help others, there's a place for you in our community support ministry.
          </p>
          <div className="space-x-4">
            <a 
              href="/contact" 
              className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Request Support
            </a>
            <a 
              href="/get-involved/volunteering" 
              className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
            >
              Volunteer Today
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}