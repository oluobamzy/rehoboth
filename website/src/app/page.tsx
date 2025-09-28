import HeroCarousel from "@/components/hero/HeroCarousel";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <>
      {/* Hero Section with Wave Divider */}
      <div className="relative overflow-hidden">
        <HeroCarousel />
        
        {/* Decorative Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" className="w-full h-20">
            <path d="M0 40L48 48C96 56 192 72 288 72C384 72 480 56 576 48C672 40 768 40 864 50C960 60 1056 80 1152 80C1248 80 1344 60 1392 50L1440 40V80H0V40Z" 
                  fill="white" />
          </svg>
        </div>
      </div>
      
      {/* Feature cards section - enhanced for visual separation */}
      <section className="relative z-20 bg-gradient-to-b from-white to-gray-50 pb-16">
        <div className="container mx-auto px-4 -mt-24">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-xl p-8 text-center transform hover:-translate-y-2 transition-transform duration-300 border-t-4 border-green-500">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-blue-900">Sunday Services</h3>
              <p className="mb-5 text-gray-600">Join us every Sunday at 3:00 PM - 6:00 PM for worship, prayer, and fellowship.</p>
              <Link href="/events" className="text-blue-600 font-medium hover:underline flex items-center justify-center gap-1 group">
                View Schedule <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-xl p-8 text-center transform hover:-translate-y-2 transition-transform duration-300 border-t-4 border-green-500">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-blue-900">Latest Sermons</h3>
              <p className="mb-5 text-gray-600">Listen to our recent messages and grow in your understanding of God&apos;s Word.</p>
              <Link href="/sermons" className="text-blue-600 font-medium hover:underline flex items-center justify-center gap-1 group">
                Listen Now <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-xl p-8 text-center transform hover:-translate-y-2 transition-transform duration-300 border-t-4 border-green-500">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-blue-900">Giving Back</h3>
              <p className="mb-5 text-gray-600">Discover opportunities to serve, connect, and make a difference in our community.</p>
              <Link href="/donate" className="text-blue-600 font-medium hover:underline flex items-center justify-center gap-1 group">
                Donate Now <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Welcome section with logo and mixed-color heading */}
      <div className="relative bg-white">
        {/* Top divider */}
        <div className="absolute top-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" className="w-full h-16 -mt-1 text-gray-50">
            <path d="M0 0L48 5.3C96 10.7 192 21.3 288 26.7C384 32 480 32 576 21.3C672 10.7 768 0 864 5.3C960 10.7 1056 32 1152 37.3C1248 42.7 1344 32 1392 26.7L1440 21.3V80H0V0Z" 
                  fill="currentColor" />
          </svg>
        </div>
        
        <div className="container mx-auto px-4 py-24">
          <section className="mb-16">
            <div className="flex flex-col items-center justify-center mb-12">
              <div className="relative mb-8">
                <div className="absolute -inset-6 bg-gradient-to-r from-blue-100 to-green-100 rounded-full opacity-70 blur-xl"></div>
                <Image 
                  src="/rehoboth_logo.jpg" 
                  alt="Rehoboth Christian Church Logo" 
                  width={220} 
                  height={132}
                  className="rounded-lg shadow-lg relative z-10"
                  priority
                />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center relative text-blue-900">
                Welcome to <span className="text-green-600">Rehoboth</span> Christian Church
                <span className="absolute -bottom-2 left-1/2 w-20 h-1 bg-blue-600 transform -translate-x-1/2"></span>
              </h2>
            </div>
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-lg md:text-xl mb-8 text-gray-700 leading-relaxed">
                A community of believers committed to loving God and serving
                people. No matter who you are, where you come from, or your
                background, you belong here. God's love is for everyone—and we
                warmly invite you to be part of our church family.
              </p>
              <div className="flex justify-center">
                <Link href="/about" className="inline-block">
                  <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg">
                    Learn More About Us
                  </button>
                </Link>
              </div>
            </div>
          </section>
          
          {/* Additional content section */}
          {/* <section className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h3 className="text-3xl font-bold mb-5 text-blue-900">Our <span className="text-green-600">Mission</span></h3>
              <p className="text-gray-600 mb-4">
                At Rehoboth Christian Church, we strive to create a welcoming community where everyone can experience God&apos;s love, grow in their faith journey, and find meaningful ways to serve others.
              </p>
              <p className="text-gray-600 mb-6">
                Whether you&apos;re seeking spiritual growth, community connection, or a place to belong, we invite you to be part of our church family.
              </p>
              <div className="space-y-3">
                <div>
                  <Link href="/about?tab=mission" className="text-blue-600 font-medium hover:underline">Read More About Our Mission →</Link>
                </div>
                <div>
                  <Link href="/about?tab=vision" className="text-blue-600 font-medium hover:underline">Discover Our Vision →</Link>
                </div>
              </div>
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg">
              <Image 
                src="/children&apos;s corner2.jpeg" 
                alt="Children&apos;s corner" 
                width={600} 
                height={400} 
                className="w-full h-full object-cover"
              />
            </div>
          </section> */}
        </div>
      </div>
      
      {/* Pastor&apos;s section */}
      <section className="bg-gray-50 py-16 mb-20 rounded-lg">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h3 className="text-3xl font-bold mb-5 text-blue-900">Meet Our <span className="text-green-600">Pastor</span></h3>
              <p className="text-gray-600 mb-4">
                Pastor Patrick and his wife lead Rehoboth Christian Church with passion and dedication. They are committed to sharing God&apos;s love and transforming lives through the power of the gospel.
              </p>
              <p className="text-gray-600 mb-6">
                We invite you to connect with us, join our services, and become part of our growing community of faith.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/about#pastor" className="inline-block">
                  <button className="bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700 transition-colors">
                    Meet the Team
                  </button>
                </Link>
                <Link href="/contact" className="inline-block">
                  <button className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-md font-medium hover:bg-blue-50 transition-colors">
                    Contact Us
                  </button>
                </Link>
              </div>
            </div>
            <div className="order-1 md:order-2 flex justify-center">
              <Image 
                src="/PastorPatrick&wife.jpg" 
                alt="Pastor Patrick and his wife" 
                width={400} 
                height={300}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Upcoming Events Section */}
      <section className="mb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-blue-900">Upcoming <span className="text-green-600">Events</span></h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Join us for these special events and activities at Rehoboth Christian Church. All are welcome!
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Event Card 1 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100">
              <div className="bg-blue-600 text-white p-2 text-center font-bold">
                SUNDAY, JUNE 23, 2025
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Sunday Worship Service</h3>
                <div className="flex items-center mb-3 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  3:00 PM - 6:00 PM
                </div>
                <div className="flex items-center mb-4 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Main Sanctuary
                </div>
                <p className="text-gray-600 mb-4">Join us for worship, prayer, and an inspiring message from Pastor Patrick.</p>
                <Link href="/events/sunday-worship">
                  <button className="w-full bg-gray-100 hover:bg-green-50 text-green-600 py-2 rounded-md font-medium transition-colors">
                    Event Details
                  </button>
                </Link>
              </div>
            </div>
            
            {/* Event Card 2 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100">
              <div className="bg-blue-600 text-white p-2 text-center font-bold">
                WEDNESDAY, JUNE 26, 2025
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Prayer Service</h3>
                <div className="flex items-center mb-3 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  7:00 PM - 9:00 PM
                </div>
                <div className="flex items-center mb-4 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Fellowship Hall
                </div>
                <p className="text-gray-600 mb-4">Join us for our midweek prayer service where we come together to pray and seek God&apos;s guidance.</p>
                <Link href="/events/bible-study">
                  <button className="w-full bg-gray-100 hover:bg-green-50 text-green-600 py-2 rounded-md font-medium transition-colors">
                    Event Details
                  </button>
                </Link>
              </div>
            </div>
            
            {/* Event Card 3 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100">
              <div className="bg-blue-600 text-white p-2 text-center font-bold">
                SATURDAY, JUNE 29, 2025
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Community Outreach</h3>
                <div className="flex items-center mb-3 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  9:00 AM - 12:00 PM
                </div>
                <div className="flex items-center mb-4 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Community Center
                </div>
                <p className="text-gray-600 mb-4">Volunteer with us as we serve our local community through this family-friendly event.</p>
                <Link href="/events/outreach">
                  <button className="w-full bg-gray-100 hover:bg-green-50 text-green-600 py-2 rounded-md font-medium transition-colors">
                    Event Details
                  </button>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <Link href="/events">
              <button className="bg-green-600 text-white px-8 py-3 rounded-md font-medium hover:bg-green-700 transition-colors">
                View All Events
              </button>
            </Link>
          </div>
        </div>
      </section>
      
      <section className="mb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-blue-900">Latest <span className="text-green-600">Sermons</span></h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Listen to our most recent messages to grow in your faith and biblical understanding.
            </p>
          </div>
          <div className="flex justify-center">
            <Link href="/sermons">
              <button className="bg-green-600 text-white px-8 py-3 rounded-md font-medium hover:bg-green-700 transition-colors">
                Browse All Sermons
              </button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Contact and Location Section */}
      <section className="bg-gray-50 py-16 rounded-lg">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-5 text-blue-900">Visit <span className="text-green-600">Us</span></h3>
              <p className="text-gray-600 mb-6">
                We&apos;d love to see you at our next service. Come experience the warmth and welcome of our church family.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mt-1 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-blue-800">Address</h4>
                    <p className="text-gray-600">414 Pleasant Park Road, Rehoboth, MA 02769</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mt-1 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-blue-800">Service Times</h4>
                    <p className="text-gray-600">Sunday: 3:00 PM - 6:00 PM<br />Wednesday: 7:00 PM - 9:00 PM (Prayer Service)<br />Friday: Women Overnight Service<br />Saturday: 7:00 PM - 9:00 PM (Youth Prayer & Choir)</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mt-1 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-blue-800">Contact</h4>
                    <p className="text-gray-600">info@rehobothchurch.org<br />+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mt-1 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-blue-800">Office Hours</h4>
                    <p className="text-gray-600">Wednesday & Friday: 11:00 AM - 5:00 PM</p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Link href="/contact" className="inline-block">
                  <button className="bg-green-600 text-white px-8 py-3 rounded-md font-medium hover:bg-green-700 transition-colors">
                    Contact Us
                  </button>
                </Link>
              </div>
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg">
              <div className="bg-gray-300 h-[300px] w-full flex items-center justify-center">
                <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 flex items-center">
                  <span className="mr-2">View on Google Maps</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
