// src/app/ministries/page.tsx
export default function MinistriesPage() {
  const ministries = [
    {
      title: "Women's Ministry",
      description: "Spiritual growth through prayer and discipleship. Support for widows, single mothers, and vulnerable women. Empowerment through microfinance and financial literacy.",
      href: "/ministries/women",
      image: "/pastoral_care.jpeg"
    },
    {
      title: "Children's Ministry",
      description: "Biblical foundation through creative teaching. Safe and inclusive environment with drama, music, art, and sports activities.",
      href: "/ministries/children",
      image: "/children'scorner.jpg"
    },
    {
      title: "Youth Ministry",
      description: "Faith development through discipleship and worship. Mentorship and life guidance with skill and career preparation workshops.",
      href: "/ministries/youth",
      image: "/pastoral_care.jpeg"
    },
    {
      title: "Evangelization Ministry",
      description: "Proclaiming the Gospel with boldness and love. Acts of mercy that demonstrate God's compassion.",
      href: "/ministries/evangelization",
      image: "/pastoral_care.jpeg"
    },
    {
      title: "Leadership Ministry",
      description: "Spiritual leadership rooted in prayer and integrity. Servant leadership modeled after Christ.",
      href: "/ministries/leadership",
      image: "/pastoral_care.jpeg"
    },
    {
      title: "Intercession Ministry",
      description: "Prayer for the church, community, and nations. Standing in the gap for the lost and hurting.",
      href: "/ministries/intercession",
      image: "/pastoral_care.jpeg"
    },
    {
      title: "Community Support Ministry",
      description: "Care for immigrants, the homeless, and families in need. Interpretation services and transportation assistance.",
      href: "/ministries/community-support",
      image: "/pastoral_care.jpeg"
    },
    {
      title: "Music Ministry",
      description: "Leading the church in worship and adoration. Encouraging spiritual growth through music.",
      href: "/ministries/music",
      image: "/pastoral_care.jpeg"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Our Ministries</h1>
            <p className="text-xl md:text-2xl text-blue-200 max-w-3xl mx-auto">
              Serving God and our community through diverse ministries that touch hearts and transform lives
            </p>
          </div>
        </div>
      </div>

      {/* Ministries Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ministries.map((ministry, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 bg-gray-200 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-white text-xl font-bold">{ministry.title}</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {ministry.description}
                </p>
                <a
                  href={ministry.href}
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  Learn More
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-emerald-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Involved?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join one of our ministries and be part of something greater. Your gifts and talents can make a difference.
          </p>
          <a
            href="/get-involved/volunteering"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Get Involved Today
          </a>
        </div>
      </div>
    </div>
  );
}