// src/app/ministries/women/page.tsx
export default function WomensMinistryPage() {
  const activities = [
    {
      title: "Prayer and Discipleship",
      description: "Weekly prayer meetings and Bible study sessions focused on spiritual growth and development.",
      schedule: "Fridays - Women Overnight Service"
    },
    {
      title: "Support Programs",
      description: "Special care and support for widows, single mothers, and vulnerable women in our community.",
      schedule: "Ongoing support as needed"
    },
    {
      title: "Financial Empowerment",
      description: "Microfinance programs and financial literacy training to help women become financially independent.",
      schedule: "Monthly workshops"
    },
    {
      title: "Skill Development",
      description: "Vocational training programs to equip women with practical skills for employment and entrepreneurship.",
      schedule: "Quarterly training sessions"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Women's Ministry</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Empowering women through faith, fellowship, and service. Join us as we grow together in God's love.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Our Mission</h2>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            To provide spiritual growth through prayer and discipleship, offer support for widows, single mothers, and vulnerable women, 
            and empower women through microfinance, financial literacy, skill development, and vocational training while fostering 
            fellowship and service in the church and community.
          </p>
        </div>
      </div>

      {/* Activities */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            What We Do
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activities.map((activity, index) => (
              <div key={index} className="bg-blue-50 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{activity.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{activity.description}</p>
                <div className="bg-blue-100 rounded-md p-3">
                  <p className="text-blue-700 font-medium">
                    <span className="font-bold">Schedule:</span> {activity.schedule}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Special Focus */}
      <div className="bg-gradient-to-r from-blue-100 to-emerald-100 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
              Special Focus Areas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Widow Support</h3>
                <p className="text-gray-600">Providing care and support for widows in our community</p>
              </div>
              <div className="text-center">
                <div className="bg-emerald-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Single Mothers</h3>
                <p className="text-gray-600">Supporting single mothers with practical and spiritual care</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Empowerment</h3>
                <p className="text-gray-600">Financial literacy and vocational training programs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Join Us */}
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Women's Ministry</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Be part of a supportive community of women who are growing in faith and making a difference.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a
              href="/get-involved/volunteering"
              className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Get Involved
            </a>
            <a
              href="/contact"
              className="inline-block border-2 border-white hover:bg-white hover:text-gray-900 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}