import Image from 'next/image';
import ContactForm from '@/components/contact/ContactForm';
import SocialMediaIcons from '@/components/contact/SocialMediaIcons';

export default function ContactPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Contact Us</h1>
        
        <div className="grid md:grid-cols-2 gap-12">
          {/* Pastor's Image and Info */}
          <div className="space-y-6">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <Image 
                src="/PastorPatrick&wife.jpg" 
                alt="Pastor Patrick and his wife" 
                width={600} 
                height={400} 
                className="w-full object-cover"
                priority
              />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Meet Our Pastor</h2>
              <p className="text-gray-700 mb-4">
                Pastor Patrick and his wife lead Rehoboth Christian Church with a passion for sharing God's love
                and transforming lives through the power of the gospel.
              </p>
              <p className="text-gray-700">
                We invite you to connect with us, join our services, and become part of our growing community of faith.
              </p>
              
              <div className="mt-6">
                <h3 className="text-xl font-medium mb-3">Connect With Us</h3>
                <SocialMediaIcons />
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6">Send Us a Message</h2>
            <ContactForm />
          </div>
        </div>
        
        {/* Church Information */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-medium mb-3 text-blue-700">Service Times</h3>
            <p>Sunday: 3:00 PM - 6:00 PM</p>
            <p>Wednesday: 7:00 PM - 9:00 PM (Prayer Service)</p>
            <p>Friday: Women Overnight Service</p>
            <p>Saturday: 7:00 PM - 9:00 PM (Youth Prayer & Choir)</p>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-medium mb-3 text-blue-700">Location</h3>
            <p>414 Pleasant Park Road</p>
            <p>Rehoboth, MA 02769</p>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-medium mb-3 text-blue-700">Contact Information</h3>
            <p>Email: rehobothchrisitianchurch2022@gmail.com</p>
            <p>Phone: (613) 400-4966</p>
          </div>
        </div>
        
        {/* Map Section */}
        <div className="mt-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Find Us</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="aspect-video w-full">
              <iframe
                src="https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=en&amp;q=414%20Pleasant%20Park%20Road,%20Rehoboth,%20MA%2002769&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=&amp;output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Rehoboth Christian Church Location"
              ></iframe>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Our Address</h3>
                  <p className="text-gray-600 mb-2">
                    <strong>414 Pleasant Park Road</strong><br />
                    Rehoboth, MA 02769
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Directions</h3>
                  <a 
                    href="https://www.google.com/maps/dir/?api=1&destination=414+Pleasant+Park+Road,+Rehoboth,+MA+02769"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 01.553-.894L9 2l6 3 6-3v15l-6 3-6-3z" />
                    </svg>
                    Get Directions
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
