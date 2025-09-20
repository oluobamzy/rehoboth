// src/app/ministries/children/page.tsx
'use client';

import React from 'react';
import Image from 'next/image';

export default function ChildrensMinistryPage() {
  const programs = [
    {
      title: "Sunday School",
      ageGroup: "Ages 3-12",
      time: "Sunday 10:00 AM - 11:00 AM",
      description: "Age-appropriate Bible lessons, crafts, and activities that help children learn about God's love.",
      image: "/children'scorner.jpg"
    },
    {
      title: "Children's Church",
      ageGroup: "Ages 5-12", 
      time: "During Sunday Service",
      description: "A special service designed just for children with worship, Bible stories, and interactive learning.",
      image: "/children's corner2.jpeg"
    },
    {
      title: "Vacation Bible School",
      ageGroup: "Ages 4-12",
      time: "Summer Program",
      description: "Week-long summer program filled with games, crafts, music, and Bible stories.",
      image: null
    },
    {
      title: "Children's Choir",
      ageGroup: "Ages 6-12",
      time: "Saturday 2:00 PM - 3:00 PM",
      description: "Children learn to worship God through music and participate in special church services.",
      image: null
    }
  ];

  const values = [
    {
      title: "Safety First",
      description: "We maintain the highest safety standards with background-checked volunteers and secure environments.",
      icon: "🛡️"
    },
    {
      title: "Age-Appropriate Learning",
      description: "Our curriculum is designed specifically for each age group's developmental needs.",
      icon: "📚"
    },
    {
      title: "Fun & Engaging",
      description: "We believe learning about God should be exciting and enjoyable for children.",
      icon: "🎉"
    },
    {
      title: "Family Partnership",
      description: "We work closely with parents to reinforce biblical values at home.",
      icon: "👨‍👩‍👧‍👦"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Children's Ministry</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              Nurturing young hearts and minds in God's love through fun, engaging, and age-appropriate programs
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
              To partner with families in raising children who know Jesus, love God's Word, and live out their faith 
              in their daily lives. We believe that every child is a precious gift from God and deserves to experience 
              His love in a safe, nurturing environment.
            </p>
            <div className="bg-yellow-50 rounded-lg p-6 border-l-4 border-yellow-500">
              <blockquote className="text-xl italic text-gray-700">
                "Let the little children come to me, and do not hinder them, for the kingdom of heaven belongs to such as these."
              </blockquote>
              <cite className="text-yellow-600 font-semibold mt-2 block">- Matthew 19:14</cite>
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
                <div key={index} className="bg-gray-50 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  {program.image && (
                    <div className="relative h-48">
                      <Image
                        src={program.image}
                        alt={program.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{program.title}</h3>
                      <span className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full">
                        {program.ageGroup}
                      </span>
                    </div>
                    <p className="text-orange-600 font-medium mb-3">{program.time}</p>
                    <p className="text-gray-600 leading-relaxed">{program.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-yellow-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">What We Value</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Volunteer Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Join Our Team</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              We're always looking for passionate individuals who love working with children and want to make a 
              difference in their spiritual development. Whether you're a teacher, storyteller, musician, or just 
              love being around kids, there's a place for you!
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-yellow-50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Sunday School Teachers</h4>
                <p className="text-sm text-gray-600">Lead age-appropriate Bible lessons and activities</p>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Children's Church Helpers</h4>
                <p className="text-sm text-gray-600">Assist with worship and learning activities</p>
              </div>
              <div className="bg-yellow-50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Special Events Team</h4>
                <p className="text-sm text-gray-600">Help organize VBS and special programs</p>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-6 mb-8">
              <h4 className="font-semibold text-gray-900 mb-2">Requirements for Volunteers:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Background check (provided by the church)</li>
                <li>• Commitment to Christian values and church mission</li>
                <li>• Heart for working with children</li>
                <li>• Regular attendance and reliability</li>
              </ul>
            </div>
            <a 
              href="/get-involved/volunteering" 
              className="inline-block bg-yellow-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
            >
              Volunteer Today
            </a>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Get Involved</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Have questions about our Children's Ministry? Want to get your child involved? We'd love to hear from you!
          </p>
          <div className="space-x-4">
            <a 
              href="/contact" 
              className="inline-block bg-white text-yellow-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Contact Us
            </a>
            <a 
              href="/events" 
              className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-yellow-600 transition-colors"
            >
              View Events
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}