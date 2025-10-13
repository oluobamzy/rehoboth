import { motion } from 'framer-motion';
import Link from 'next/link';
import EditableContent from '@/components/common/EditableContent';

export default function AboutContent() {
  return (
    <div className="prose prose-lg max-w-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <EditableContent
          pageKey="about"
          sectionKey="main_content"
          fallbackContent={`
            <p class="text-lg">
              Rehoboth Christian Church is a vibrant community of believers committed to loving God and serving people. 
              No matter who you are, where you come from, or your background, you belong here. God's love is for everyone—and we 
              warmly invite you to be part of our church family.
            </p>

            <p class="mt-4">
              We are a Christ-centered community that believes in the transformative power of God's love. Through worship, 
              fellowship, biblical teaching, and compassionate service, we create an environment where everyone can grow 
              in their faith and experience the abundant life that Jesus offers.
            </p>
          `}
        />

        {/* Our Motto */}
        <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500 mb-8 mt-8">
          <h2 className="text-2xl font-bold mb-4 text-green-700">Our Motto</h2>
          <EditableContent
            pageKey="about"
            sectionKey="motto"
            fallbackContent={`
              <p class="text-xl font-semibold text-green-800">
                Christ-Centered, Compassion-Driven, Community-Focused
              </p>
            `}
          />
        </div>

        {/* Our Commitment */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-blue-900">Our Commitment</h2>
          <EditableContent
            pageKey="about"
            sectionKey="commitment"
            fallbackContent={`
              <p class="text-lg text-gray-700">
                We commit to follow Jesus, grow in His Word, and show His love through prayer, worship, and service to others.
              </p>
            `}
          />
        </div>

        <p className="mt-6 text-lg font-medium text-gray-700">
          Whether you are new to the faith or have been walking with Christ for years, Rehoboth Christian Church 
          is a place where you can belong, grow, and serve. We invite you to join us on this journey of faith 
          as we seek to glorify God and live out His purpose in our lives.
        </p>

        <div className="mt-10 flex justify-center">
          <Link href="/contact" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Contact Us
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
