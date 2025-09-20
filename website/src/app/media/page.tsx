// src/app/media/page.tsx
import Link from 'next/link';

export default function MediaPage() {
  const mediaItems = [
    {
      title: "Live Stream",
      description: "Watch our services live on YouTube every Sunday at 3 PM and Wednesday at 7 PM.",
      href: "/media/live-stream",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      buttonText: "Watch Live",
      bgColor: "bg-blue-600"
    },
    {
      title: "Photo Gallery",
      description: "Browse photos from our church events, services, and community activities.",
      href: "/media/gallery",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      buttonText: "View Gallery",
      bgColor: "bg-blue-500"
    },
    {
      title: "Sermons",
      description: "Listen to our latest sermons and past messages from Pastor Patrick and guest speakers.",
      href: "/sermons",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
      buttonText: "Listen to Sermons",
      bgColor: "bg-emerald-600"
    }
  ];

  const recentSermons = [
    {
      title: "Walking in Faith",
      speaker: "Pastor Patrick",
      date: "December 15, 2024",
      thumbnail: "/pastoral_care.jpeg"
    },
    {
      title: "God's Love Transforms",
      speaker: "Pastor Patrick",
      date: "December 8, 2024",
      thumbnail: "/pastoral_care.jpeg"
    },
    {
      title: "The Power of Prayer",
      speaker: "Pastor Patrick",
      date: "December 1, 2024",
      thumbnail: "/pastoral_care.jpeg"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Media Center</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Access our live streams, photo galleries, and sermon archives. Stay connected with our church community.
            </p>
          </div>
        </div>
      </div>

      {/* Media Options */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mediaItems.map((item, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className={`${item.bgColor} p-8 text-white text-center`}>
                <div className="mb-4 flex justify-center text-white">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {item.description}
                </p>
                <Link
                  href={item.href}
                  className={`inline-block ${item.bgColor} hover:opacity-90 text-white font-bold py-3 px-6 rounded-lg transition-opacity w-full text-center`}
                >
                  {item.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Sermons Preview */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Recent Sermons
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Catch up on our latest messages and be encouraged in your faith journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentSermons.map((sermon, index) => (
              <div key={index} className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="h-48 bg-gray-200 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-sm opacity-90">{sermon.date}</p>
                    <h4 className="text-lg font-bold">{sermon.title}</h4>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 text-sm mb-2">Speaker: {sermon.speaker}</p>
                  <Link
                    href="/sermons"
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Listen Now →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/sermons"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              View All Sermons
            </Link>
          </div>
        </div>
      </div>

      {/* Live Stream Info */}
      <div className="bg-blue-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Join Us Live Online
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Can't make it to church? No problem! Join us online for our live services.
          </p>
          <div className="bg-white rounded-lg p-8 max-w-2xl mx-auto shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Service Times</h3>
            <div className="space-y-3 text-lg">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">Sunday Service</span>
                <span className="text-blue-600 font-bold">3:00 PM - 6:00 PM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Wednesday Prayer</span>
                <span className="text-blue-600 font-bold">7:00 PM - 9:00 PM</span>
              </div>
            </div>
            <Link
              href="/media/live-stream"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors mt-6"
            >
              Watch Live Stream
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}