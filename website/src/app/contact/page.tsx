import Image from 'next/image';
import ContactForm from '@/components/contact/ContactForm';
import SocialMediaIcons from '@/components/contact/SocialMediaIcons';
import DynamicContactInfo from '@/components/contact/DynamicContactInfo';
import DynamicMapSection from '@/components/contact/DynamicMapSection';

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
        <DynamicContactInfo />
        
        {/* Map Section */}
        <DynamicMapSection />
      </div>
    </main>
  );
}