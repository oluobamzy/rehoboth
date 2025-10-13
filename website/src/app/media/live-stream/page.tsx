// src/app/media/live-stream/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function LiveStreamPage() {
  const [isLive, setIsLive] = useState(false);
  const [nextServiceTime, setNextServiceTime] = useState('');

  useEffect(() => {
    // Check if it's currently service time
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 3 = Wednesday
    const currentHour = now.getHours();
    
    // Sunday 3-6 PM or Wednesday 7-9 PM
    if ((currentDay === 0 && currentHour >= 15 && currentHour < 18) || 
        (currentDay === 3 && currentHour >= 19 && currentHour < 21)) {
      setIsLive(true);
    }

    // Calculate next service time
    const getNextService = () => {
      const today = new Date();
      const currentDay = today.getDay();
      const currentHour = today.getHours();
      
      // If it's before Sunday 3 PM
      if (currentDay < 0 || (currentDay === 0 && currentHour < 15)) {
        const nextSunday = new Date(today);
        nextSunday.setDate(today.getDate() + (0 - currentDay));
        nextSunday.setHours(15, 0, 0, 0);
        return `Sunday, ${nextSunday.toLocaleDateString()} at 3:00 PM`;
      }
      // If it's before Wednesday 7 PM
      else if (currentDay <= 3 && (currentDay < 3 || currentHour < 19)) {
        const nextWednesday = new Date(today);
        nextWednesday.setDate(today.getDate() + (3 - currentDay));
        nextWednesday.setHours(19, 0, 0, 0);
        return `Wednesday, ${nextWednesday.toLocaleDateString()} at 7:00 PM`;
      }
      // Next Sunday
      else {
        const nextSunday = new Date(today);
        nextSunday.setDate(today.getDate() + (7 - currentDay));
        nextSunday.setHours(15, 0, 0, 0);
        return `Sunday, ${nextSunday.toLocaleDateString()} at 3:00 PM`;
      }
    };

    setNextServiceTime(getNextService());
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Live Stream</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Join us online for worship, prayer, and inspiring messages. Can't be there in person? You're still part of our family!
            </p>
          </div>
        </div>
      </div>

      {/* Live Status */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {isLive ? (
            <div className="bg-emerald-100 border border-emerald-400 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-emerald-700 font-bold text-lg">🔴 LIVE NOW</span>
                </div>
              </div>
              <p className="text-emerald-600 text-center mt-2">We're currently live! Join the service below.</p>
            </div>
          ) : (
            <div className="bg-blue-100 border border-blue-400 rounded-lg p-6 mb-8">
              <div className="text-center">
                <span className="text-blue-700 font-bold text-lg">📅 Next Service</span>
                <p className="text-blue-600 mt-2">{nextServiceTime}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video Player */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="relative aspect-w-16 aspect-h-9">
              {/* YouTube Live Stream Embed */}
              <div className="relative w-full h-96 md:h-[500px] bg-gray-900 rounded-lg overflow-hidden">
                {isLive ? (
                  <iframe
                    src="https://www.youtube.com/embed/live_stream?channel=UC-yUYcusNxkfA2qyjQMFblA&autoplay=0"
                    title="Rehoboth Christian Church Live Stream"
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white text-center">
                    <div>
                      <div className="text-6xl mb-4">📺</div>
                      <h3 className="text-xl font-bold mb-2">Service Not Currently Live</h3>
                      <p className="text-gray-300 mb-4">Next service: {nextServiceTime}</p>
                      <a
                        href="https://www.youtube.com/@OfficiallRCC"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"
                      >
                        Visit Our YouTube Channel
                      </a>
                    </div>
                  </div>
                )}
                {/* Always show direct link */}
                <div className="absolute top-4 right-4">
                  <a
                    href="https://www.youtube.com/@OfficiallRCC/streams"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors shadow-lg"
                  >
                    Open in YouTube
                  </a>
                </div>
              </div>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isLive ? 'Live Service Now' : 'Rehoboth Christian Church'}
              </h2>
              <p className="text-gray-600 mb-4">
                {isLive 
                  ? 'Join us for live worship, prayer, and inspiring messages from Pastor Patrick.' 
                  : 'Experience worship with us online. When we\'re not live, watch our latest service or sermon.'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="https://www.youtube.com/@OfficiallRCC"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  Visit Our Channel
                </a>
                <a
                  href="https://www.youtube.com/@OfficiallRCC?sub_confirmation=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Subscribe
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Videos Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Recent Services & Sermons
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Catch up on recent messages, worship services, and special events from Rehoboth Christian Church.
              </p>
            </div>
            
            {/* Recent Videos Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {/* Video 1 - Latest Sunday Service */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative aspect-w-16 aspect-h-9">
                  <iframe
                    src="https://www.youtube.com/embed?listType=playlist&list=UU-yUYcusNxkfA2qyjQMFblA&index=1"
                    title="Latest Sunday Service"
                    className="w-full h-48"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Latest Sunday Service</h3>
                  <p className="text-gray-600 text-sm mb-3">Join us for inspiring worship and powerful messages from Pastor Patrick.</p>
                  <a
                    href="https://www.youtube.com/@OfficiallRCC"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-red-600 hover:text-red-700 font-medium"
                  >
                    Watch on YouTube
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Video 2 - Recent Sermon */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative aspect-w-16 aspect-h-9">
                  <iframe
                    src="https://www.youtube.com/embed?listType=playlist&list=UU-yUYcusNxkfA2qyjQMFblA&index=2"
                    title="Recent Sermon"
                    className="w-full h-48"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Recent Sermon</h3>
                  <p className="text-gray-600 text-sm mb-3">Powerful biblical teaching and spiritual guidance for your faith journey.</p>
                  <a
                    href="https://www.youtube.com/@OfficiallRCC"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-red-600 hover:text-red-700 font-medium"
                  >
                    Watch on YouTube
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Video 3 - Prayer Service */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative aspect-w-16 aspect-h-9">
                  <iframe
                    src="https://www.youtube.com/embed?listType=playlist&list=UU-yUYcusNxkfA2qyjQMFblA&index=3"
                    title="Prayer Service"
                    className="w-full h-48"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Prayer Service</h3>
                  <p className="text-gray-600 text-sm mb-3">Join our midweek prayer service for fellowship and spiritual growth.</p>
                  <a
                    href="https://www.youtube.com/@OfficiallRCC"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-red-600 hover:text-red-700 font-medium"
                  >
                    Watch on YouTube
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* View All Videos Button */}
            <div className="text-center">
              <a
                href="https://www.youtube.com/@OfficiallRCC/videos"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg transition-colors shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                View All Videos
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Service Schedule */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
              Service Schedule
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-blue-50 rounded-lg p-8 text-center">
                <div className="text-blue-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Sunday Service</h3>
                <p className="text-3xl font-bold text-blue-600 mb-2">3:00 PM - 6:00 PM</p>
                <p className="text-gray-600">Main worship service with Pastor Patrick</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-8 text-center">
                <div className="text-emerald-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.11 6.11A7.96 7.96 0 0012 4c4.418 0 8 3.582 8 8 0 1.315-.317 2.555-.877 3.65M8.11 6.11l.877 3.65m0 0c1.095-.56 2.335-.877 3.65-.877M8.987 9.76L12 4m0 0l3.013 5.76M12 4v16m0-16L8.987 9.76m6.026 0C16.682 8.681 18 10.317 18 12.24c0 .96-.48 1.92-1.44 2.4L12 20l-4.56-5.36C6.48 14.16 6 13.2 6 12.24c0-1.923 1.318-3.559 3.013-4.48z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Wednesday Prayer</h3>
                <p className="text-3xl font-bold text-emerald-600 mb-2">7:00 PM - 9:00 PM</p>
                <p className="text-gray-600">Prayer service and fellowship</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connect Online */}
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Connected</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Follow us on social media and subscribe to our YouTube channel to never miss a service.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a
              href="https://www.youtube.com/@OfficiallRCC?sub_confirmation=1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              Subscribe on YouTube
            </a>
            <a
              href="/contact"
              className="inline-block border-2 border-white hover:bg-white hover:text-gray-900 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Contact Church
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}