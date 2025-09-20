// src/app/get-involved/page.tsx
export default function GetInvolvedPage() {
  const opportunities = [
    {
      title: "Apply for Volunteering",
      description: "Join our volunteer team and serve in various capacities. From hospitality to technical support, there's a place for everyone.",
      href: "/get-involved/volunteering",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      buttonText: "Apply to Volunteer"
    },
    {
      title: "Church Membership",
      description: "Become an official member of our church family. Join us in our mission to love God and serve people.",
      href: "/get-involved/membership",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      buttonText: "Join Our Church"
    },
    {
      title: "Prayer Request",
      description: "Submit a prayer request and let our prayer team intercede for you. We believe in the power of prayer.",
      href: "/get-involved/prayer-request",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.11 6.11A7.96 7.96 0 0012 4c4.418 0 8 3.582 8 8 0 1.315-.317 2.555-.877 3.65M8.11 6.11l.877 3.65m0 0c1.095-.56 2.335-.877 3.65-.877M8.987 9.76L12 4m0 0l3.013 5.76M12 4v16m0-16L8.987 9.76m6.026 0C16.682 8.681 18 10.317 18 12.24c0 .96-.48 1.92-1.44 2.4L12 20l-4.56-5.36C6.48 14.16 6 13.2 6 12.24c0-1.923 1.318-3.559 3.013-4.48z" />
        </svg>
      ),
      buttonText: "Submit Prayer Request"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Get Involved</h1>
            <p className="text-xl md:text-2xl text-emerald-100 max-w-3xl mx-auto">
              Join our church family and be part of God's work in our community. There are many ways to get involved and make a difference.
            </p>
          </div>
        </div>
      </div>

      {/* Opportunities Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ways to Get Involved
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose how you'd like to participate in our church community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {opportunities.map((opportunity, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="text-blue-600 mb-6 flex justify-center">
                {opportunity.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {opportunity.title}
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {opportunity.description}
              </p>
              <a
                href={opportunity.href}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                {opportunity.buttonText}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Have Questions?
          </h2>
          <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
            We're here to help you find your place in our church family. Don't hesitate to reach out.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-block bg-white hover:bg-gray-100 text-blue-800 font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Contact Us
            </a>
            <a
              href="tel:613-400-4966"
              className="inline-block border-2 border-white hover:bg-white hover:text-blue-800 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Call: 613-400-4966
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}