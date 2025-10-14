"use client";

import DatabaseHeroCarousel from "@/components/hero/DatabaseHeroCarousel";
import Link from "next/link";
import Image from "next/image";
import EditableContent from "@/components/common/EditableContent";
import EditableImage from "@/components/common/EditableImage";
import DynamicEventCards from "@/components/common/DynamicEventCards";
import ServiceTimes from "@/components/common/ServiceTimes";
import ContactInfo from "@/components/common/ContactInfo";
import FeatureCardTitle from "@/components/common/FeatureCardTitle";

export default function Home() {
  return (
    <>
      {/* Hero Section with Wave Divider */}
      <div className="relative overflow-hidden">
        <DatabaseHeroCarousel />
        
        {/* Decorative Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" className="w-full h-20">
            <path d="M0 40L48 48C96 56 192 72 288 72C384 72 480 56 576 48C672 40 768 40 864 50C960 60 1056 80 1152 80C1248 80 1344 60 1392 50L1440 40V80H0V40Z" 
                  fill="white" />
          </svg>
        </div>
      </div>
      
      {/* Feature cards section - enhanced for visual separation */}
      <section className="relative z-20 bg-gradient-to-b from-white to-gray-50 py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl -mt-16 sm:-mt-20 lg:-mt-24">
          <div className="grid gap-8 sm:gap-10 lg:gap-12 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
            <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 text-center transform hover:-translate-y-2 transition-transform duration-300 border-t-4 border-green-500">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <FeatureCardTitle
                pageKey="home"
                sectionKey="feature_cards_titles"
                cardType="sunday_services"
              />
              <EditableContent
                pageKey="home"
                sectionKey="sunday_services_description"
                fallbackContent="<p class='mb-4 sm:mb-5 text-gray-600 text-sm sm:text-base'>Join us every Sunday at 3:00 PM - 6:00 PM for worship, prayer, and fellowship.</p>"
              />
              <Link href="/events" className="text-blue-600 font-medium hover:underline flex items-center justify-center gap-1 group text-sm sm:text-base">
                View Schedule <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-xl p-8 sm:p-10 lg:p-12 text-center transform hover:-translate-y-3 transition-all duration-300 border-t-4 border-green-500 hover:shadow-2xl group">
              <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 mb-6 sm:mb-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <FeatureCardTitle
                pageKey="home"
                sectionKey="feature_cards_titles"
                cardType="latest_sermons"
              />
              <EditableContent
                pageKey="home"
                sectionKey="latest_sermons_description"
                fallbackContent="<p class='mb-4 sm:mb-5 text-gray-600 text-sm sm:text-base'>Listen to our recent messages and grow in your understanding of God's Word.</p>"
              />
              <Link href="/sermons" className="text-blue-600 font-medium hover:underline flex items-center justify-center gap-1 group text-sm sm:text-base">
                Listen Now <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-xl p-8 sm:p-10 lg:p-12 text-center transform hover:-translate-y-3 transition-all duration-300 border-t-4 border-green-500 hover:shadow-2xl group md:col-span-2 lg:col-span-1">
              <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 mb-6 sm:mb-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <FeatureCardTitle
                pageKey="home"
                sectionKey="feature_cards_titles"
                cardType="giving_back"
              />
              <EditableContent
                pageKey="home"
                sectionKey="giving_back_description"
                fallbackContent="<p class='mb-4 sm:mb-5 text-gray-600 text-sm sm:text-base'>Discover opportunities to serve, connect, and make a difference in our community.</p>"
              />
              <Link href="/donate" className="text-blue-600 font-medium hover:underline flex items-center justify-center gap-1 group text-sm sm:text-base">
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
        
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-6xl py-16 sm:py-20 lg:py-28">
                    <section className="mb-16 sm:mb-20 lg:mb-24">
            {/* Logo Section */}
            <div className="flex justify-center mb-8 sm:mb-10 lg:mb-12">
              <div className="relative">
                <Image 
                  src="/rehoboth_logo_plain.png" 
                  alt="Rehoboth Christian Church Logo" 
                  width={160} 
                  height={160} 
                  className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-44 lg:h-44 object-contain drop-shadow-xl"
                  priority
                />
              </div>
            </div>
            
            {/* Welcome Heading */}
            <div className="text-center mb-8 sm:mb-10 lg:mb-12">
              <EditableContent
                pageKey="home"
                sectionKey="welcome_heading"
                fallbackContent="<h2 class='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 text-center relative text-blue-900 leading-tight'>Welcome to <span class='text-green-600'>Rehoboth</span> Christian Church<span class='absolute -bottom-2 sm:-bottom-3 left-1/2 w-20 sm:w-24 h-1 sm:h-1.5 bg-blue-600 transform -translate-x-1/2 rounded-full'></span></h2>"
              />
            </div>
            
            <div className="max-w-4xl mx-auto text-center px-4">
              <EditableContent
                pageKey="home"
                sectionKey="welcome_message"
                fallbackContent="<p class='text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 lg:mb-12 text-gray-700 leading-relaxed font-light'>A community of believers committed to loving God and serving people. No matter who you are, where you come from, or your background, you belong here. God's love is for everyone—and we warmly invite you to be part of our church family.</p>"
              />
              <div className="flex justify-center mt-8">
                <Link href="/about" className="inline-block">
                  <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-base sm:text-lg lg:text-xl">
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
      
      {/* Pastor's section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 sm:py-20 lg:py-24 mb-16 sm:mb-20 lg:mb-24 rounded-2xl mx-6 sm:mx-8 lg:mx-12 shadow-lg">
        <div className="container mx-auto px-8 sm:px-10 lg:px-16 max-w-6xl">
          <div className="grid gap-12 sm:gap-16 lg:gap-20 md:grid-cols-2 items-center">
            <div className="order-2 md:order-1 space-y-6">
              <EditableContent
                pageKey="home"
                sectionKey="pastor_title"
                fallbackContent="<h3 class='text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 text-blue-900 leading-tight'>Meet Our <span class='text-green-600'>Pastor</span></h3>"
              />
              <EditableContent
                pageKey="home"
                sectionKey="pastor_introduction"
                fallbackContent="<p class='text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg lg:text-xl leading-relaxed'>Pastor Patrick and his wife lead Rehoboth Christian Church with passion and dedication. They are committed to sharing God's love and transforming lives through the power of the gospel.</p><p class='text-gray-600 mb-8 sm:mb-10 text-base sm:text-lg lg:text-xl leading-relaxed'>We invite you to connect with us, join our services, and become part of our growing community of faith.</p>"
              />
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 pt-4">
                <Link href="/about#pastor" className="inline-block">
                  <button className="w-full sm:w-auto bg-green-600 text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-xl font-semibold hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-base sm:text-lg">
                    Meet the Team
                  </button>
                </Link>
                <Link href="/contact" className="inline-block">
                  <button className="w-full sm:w-auto border-2 border-blue-600 text-blue-600 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-xl font-semibold hover:bg-blue-50 hover:border-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 text-base sm:text-lg">
                    Contact Us
                  </button>
                </Link>
              </div>
            </div>
            <div className="order-1 md:order-2 flex justify-center">
              <EditableImage
                pageKey="home"
                sectionKey="pastor_image"
                fallbackSrc="/PastorPatrick&wife.jpg"
                alt="Pastor Patrick and his wife"
                width={400}
                height={300}
                className="rounded-lg shadow-lg w-full max-w-sm sm:max-w-md lg:max-w-lg h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Upcoming Events Section */}
      <section className="mb-16 sm:mb-20 lg:mb-24 px-6 sm:px-8 lg:px-12">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 text-blue-900 leading-tight">Upcoming <span className="text-green-600">Events</span></h2>
            <EditableContent
              pageKey="home"
              sectionKey="events_section_description"
              fallbackContent="<p class='text-gray-600 max-w-4xl mx-auto text-lg sm:text-xl lg:text-2xl leading-relaxed'>Join us for these special events and activities at Rehoboth Christian Church. All are welcome!</p>"
            />
          </div>
          
                    
          <DynamicEventCards
            pageKey="home"
            sectionKey="event_cards"
            maxCards={3}
          />
          
          <div className="text-center mt-10 sm:mt-12 lg:mt-16">
            <Link href="/events">
              <button className="bg-green-600 text-white px-8 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 rounded-xl font-semibold hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-base sm:text-lg lg:text-xl">
                View All Events
              </button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Latest Sermons Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16 sm:py-20 lg:py-24 mb-16 sm:mb-20 lg:mb-24 rounded-2xl mx-6 sm:mx-8 lg:mx-12 shadow-lg">
        <div className="container mx-auto px-8 sm:px-10 lg:px-16 max-w-6xl">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 text-blue-900 leading-tight">Latest <span className="text-green-600">Sermons</span></h2>
            <EditableContent
              pageKey="home"
              sectionKey="sermons_section_description"
              fallbackContent="<p class='text-gray-600 max-w-4xl mx-auto text-lg sm:text-xl lg:text-2xl leading-relaxed'>Listen to our most recent messages to grow in your faith and biblical understanding.</p>"
            />
          </div>
          <div className="flex justify-center">
            <Link href="/sermons">
              <button className="bg-green-600 text-white px-8 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 rounded-xl font-semibold hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-base sm:text-lg lg:text-xl">
                Browse All Sermons
              </button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Contact and Location Section */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-50 py-16 sm:py-20 lg:py-24 rounded-2xl mx-6 sm:mx-8 lg:mx-12 shadow-lg">
        <div className="container mx-auto px-8 sm:px-10 lg:px-16 max-w-6xl">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 text-blue-900 leading-tight">Visit <span className="text-green-600">Us</span></h2>
            <EditableContent
              pageKey="home"
              sectionKey="visit_us_description"
              fallbackContent="<p class='text-gray-600 max-w-4xl mx-auto text-lg sm:text-xl lg:text-2xl leading-relaxed'>We'd love to meet you! Join us for worship, fellowship, and community. Everyone is welcome at Rehoboth Christian Church.</p>"
            />
          </div>
          
          <div className="grid gap-12 sm:gap-16 lg:gap-20 md:grid-cols-2 items-center">
            <div className="space-y-8 sm:space-y-10">
              <div>
                <ServiceTimes
                  pageKey="home"
                  sectionKey="service_times"
                />
              </div>
              
              <div>
                <ContactInfo
                  pageKey="home"
                  sectionKey="contact_information"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 pt-4">
                <Link href="/about" className="inline-block">
                  <button className="w-full sm:w-auto bg-green-600 text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-xl font-semibold hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-base sm:text-lg">
                    Learn More
                  </button>
                </Link>
                <Link href="/contact" className="inline-block">
                  <button className="w-full sm:w-auto bg-orange-500 text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-xl font-semibold hover:bg-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-base sm:text-lg">
                    Contact Us
                  </button>
                </Link>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <div className="bg-gradient-to-br from-gray-300 to-gray-400 h-[300px] sm:h-[350px] lg:h-[400px] w-full flex items-center justify-center">
                <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700 flex items-center text-base sm:text-lg lg:text-xl font-semibold transition-colors group">
                  <span className="mr-3">View on Google Maps</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 01.553-.894L9 2l6 3 6-3v15l-6 3-6-3z" />
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
