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
      
      {/* Welcome section with mixed-color heading */}
      <div className="container mx-auto px-4 py-20">
        <section className="mb-16">
          <h2 className="text-4xl font-bold mb-6 text-center">
            Welcome to <span className="text-orange-500">Rehoboth</span> Christian Church
          </h2>
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
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold mb-5">Our <span className="text-orange-500">Mission</span></h3>
            <p className="text-gray-600 mb-4">
              At Rehoboth Christian Church, we strive to create a welcoming community where everyone can experience God&apos;s love, grow in their faith journey, and find meaningful ways to serve others.
            </p>
            <p className="text-gray-600 mb-6">
              Whether you&apos;re seeking spiritual growth, community connection, or a place to belong, we invite you to be part of our church family.
            </p>
            <Link href="/about" className="text-orange-500 font-medium hover:underline">Read More About Our Vision →</Link>
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
      </div>
    </MainLayout>
  );
}
