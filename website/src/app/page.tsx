import HeroCarousel from "@/components/hero/HeroCarousel";
import MainLayout from "@/components/common/MainLayout";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <MainLayout>
      <HeroCarousel />
      
      {/* Feature cards section - similar to landing3.PNG */}
      <section className="relative z-10 container mx-auto px-4 -mt-20">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center transform hover:-translate-y-1 transition-transform duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-5 rounded-full bg-orange-100 text-orange-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">Sunday Services</h3>
            <p className="mb-4 text-gray-600">Join us every Sunday at 10:00 AM for worship, prayer, and fellowship.</p>
            <Link href="/events" className="text-orange-500 font-medium hover:underline">View Schedule →</Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-8 text-center transform hover:-translate-y-1 transition-transform duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-5 rounded-full bg-orange-100 text-orange-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">Latest Sermons</h3>
            <p className="mb-4 text-gray-600">Listen to our recent messages and grow in your understanding of God&apos;s Word.</p>
            <Link href="/sermons" className="text-orange-500 font-medium hover:underline">Listen Now →</Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-8 text-center transform hover:-translate-y-1 transition-transform duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-5 rounded-full bg-orange-100 text-orange-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">Giving Back</h3>
            <p className="mb-4 text-gray-600">Discover opportunities to serve, connect, and make a difference in our community.</p>
            <Link href="/donate" className="text-orange-500 font-medium hover:underline">Donate Now →</Link>
          </div>
        </div>
      </section>
      
      {/* Welcome section with logo and mixed-color heading */}
      <div className="container mx-auto px-4 py-20">
        <section className="mb-16">
          <div className="flex flex-col items-center justify-center mb-8">
            <Image 
              src="/rehoboth_logo.jpg" 
              alt="Rehoboth Christian Church Logo" 
              width={200} 
              height={120}
              className="mb-6 rounded-lg shadow-md"
              priority
            />
            <h2 className="text-4xl font-bold mb-2 text-center">
              Welcome to <span className="text-orange-500">Rehoboth</span> Christian Church
            </h2>
          </div>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg mb-6 text-gray-600">
              Join us for worship and fellowship as we grow together in faith. We are a community committed to following Jesus Christ and serving our neighbors with compassion and love.
            </p>
            <div className="flex justify-center">
              <Link href="/about" className="inline-block">
                <button className="bg-orange-500 text-white px-8 py-3 rounded-md font-medium hover:bg-orange-600 transition-colors">
                  Learn More About Us
                </button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Additional content section */}
        <section className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h3 className="text-3xl font-bold mb-5">Our <span className="text-orange-500">Mission</span></h3>
            <p className="text-gray-600 mb-4">
              At Rehoboth Christian Church, we strive to create a welcoming community where everyone can experience God&apos;s love, grow in their faith journey, and find meaningful ways to serve others.
            </p>
            <p className="text-gray-600 mb-6">
              Whether you&apos;re seeking spiritual growth, community connection, or a place to belong, we invite you to be part of our church family.
            </p>
            <div className="space-y-3">
              <div>
                <Link href="/about?tab=mission" className="text-orange-500 font-medium hover:underline">Read More About Our Mission →</Link>
              </div>
              <div>
                <Link href="/about?tab=vision" className="text-orange-500 font-medium hover:underline">Discover Our Vision →</Link>
              </div>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden shadow-lg">
            <Image 
              src="https://images.unsplash.com/photo-1536500152107-01ab1422f932?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80" 
              alt="Church community" 
              width={600} 
              height={400} 
              className="w-full h-full object-cover"
            />
          </div>
        </section>
        
        {/* Pastor's section */}
        <section className="bg-gray-50 py-16 mb-20 rounded-lg">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-3xl font-bold mb-5">Meet Our <span className="text-orange-500">Pastor</span></h3>
                <p className="text-gray-600 mb-4">
                  Pastor Patrick and his wife lead Rehoboth Christian Church with passion and dedication. They are committed to sharing God's love and transforming lives through the power of the gospel.
                </p>
                <p className="text-gray-600 mb-6">
                  We invite you to connect with us, join our services, and become part of our growing community of faith.
                </p>
                <Link href="/contact" className="bg-orange-500 text-white px-6 py-3 rounded-md font-medium hover:bg-orange-600 transition-colors inline-block">
                  Contact Us
                </Link>
              </div>
              <div className="rounded-lg overflow-hidden shadow-lg order-1 md:order-2">
                <Image 
                  src="/PastorPatrick&wife.jpg" 
                  alt="Pastor Patrick and Wife" 
                  width={600} 
                  height={400} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Upcoming Events Section */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold mb-5">Upcoming <span className="text-orange-500">Events</span></h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join us for these upcoming events and activities at Rehoboth Christian Church.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Event 1 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-blue-500 text-white p-4">
                <div className="text-center">
                  <span className="block text-2xl font-bold">15</span>
                  <span className="block text-sm uppercase">June</span>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-bold text-xl mb-2">Prayer & Worship Night</h4>
                <p className="text-gray-600 mb-4">
                  Join us for an evening of prayer, worship, and seeking God together as a community.
                </p>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  7:00 PM - 9:00 PM
                </div>
                <Link href="/events" className="text-blue-500 font-medium hover:underline">Learn More →</Link>
              </div>
            </div>

            {/* Event 2 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-green-500 text-white p-4">
                <div className="text-center">
                  <span className="block text-2xl font-bold">22</span>
                  <span className="block text-sm uppercase">June</span>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-bold text-xl mb-2">Community Outreach</h4>
                <p className="text-gray-600 mb-4">
                  Volunteer to serve our local community through various outreach initiatives and programs.
                </p>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  9:00 AM - 2:00 PM
                </div>
                <Link href="/events" className="text-green-500 font-medium hover:underline">Learn More →</Link>
              </div>
            </div>

            {/* Event 3 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-purple-500 text-white p-4">
                <div className="text-center">
                  <span className="block text-2xl font-bold">29</span>
                  <span className="block text-sm uppercase">June</span>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-bold text-xl mb-2">Bible Study Group</h4>
                <p className="text-gray-600 mb-4">
                  Join our weekly Bible study group as we dive deeper into God's Word together.
                </p>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  6:30 PM - 8:00 PM
                </div>
                <Link href="/events" className="text-purple-500 font-medium hover:underline">Learn More →</Link>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link href="/events" className="inline-block bg-orange-500 text-white px-8 py-3 rounded-md font-medium hover:bg-orange-600 transition-colors">
              View All Events
            </Link>
          </div>
        </section>

        {/* Connect with us - Social Media */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold mb-5">Connect With <span className="text-orange-500">Us</span></h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Follow us on social media to stay updated with the latest events, sermons, and announcements from Rehoboth Christian Church.
            </p>
          </div>
          
          <div className="flex justify-center space-x-6">
            <a href="https://facebook.com/rehobothcchurch" target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white p-4 rounded-full transition hover:bg-blue-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z"></path></svg>
            </a>
            <a href="https://instagram.com/rehobothcchurch" target="_blank" rel="noopener noreferrer" className="bg-pink-600 text-white p-4 rounded-full transition hover:bg-pink-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>
            </a>
            <a href="https://youtube.com/rehobothcchurch" target="_blank" rel="noopener noreferrer" className="bg-red-600 text-white p-4 rounded-full transition hover:bg-red-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path></svg>
            </a>
            <a href="https://twitter.com/rehobothcchurch" target="_blank" rel="noopener noreferrer" className="bg-blue-400 text-white p-4 rounded-full transition hover:bg-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
            </a>
          </div>
        </section>

        {/* Contact and Location Section */}
        <section className="bg-gray-50 py-16 rounded-lg">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="p-6">
              <h3 className="text-3xl font-bold mb-5">Visit <span className="text-orange-500">Us</span></h3>
              <div className="mb-6">
                <h4 className="font-bold text-lg mb-2">Service Times</h4>
                <p className="text-gray-600">Sunday Morning: 10:00 AM</p>
                <p className="text-gray-600">Wednesday Bible Study: 7:00 PM</p>
              </div>
              <div className="mb-6">
                <h4 className="font-bold text-lg mb-2">Location</h4>
                <p className="text-gray-600">123 Faith Avenue</p>
                <p className="text-gray-600">Ottawa, ON K1A 0A1</p>
              </div>
              <div className="mb-8">
                <h4 className="font-bold text-lg mb-2">Contact Information</h4>
                <p className="text-gray-600">Email: info@rehobothcchurch.org</p>
                <p className="text-gray-600">Phone: (613) 123-4567</p>
              </div>
              <Link href="/contact" className="bg-orange-500 text-white px-6 py-3 rounded-md font-medium hover:bg-orange-600 transition-colors inline-block">
                Contact Us
              </Link>
            </div>
            <div className="p-6">
              {/* This would be a good place for a map or church building image */}
              <div className="bg-white p-4 rounded-lg shadow-md h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-5 rounded-full bg-orange-100 text-orange-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold mb-3">Find Us On Google Maps</h4>
                  <p className="text-gray-600 mb-6">
                    Get directions to our church location and join us for worship this Sunday.
                  </p>
                  <a 
                    href="https://maps.google.com/?q=Ottawa+Church" 
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="text-orange-500 font-medium hover:underline flex items-center justify-center"
                  >
                    Open in Google Maps
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
