import { motion } from 'framer-motion';
import Link from 'next/link';

export default function VisionComponent() {
  return (
    <div className="prose prose-lg max-w-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">Our Vision</h2>
          <h3 className="text-xl font-semibold mb-3 text-green-600">Loving God, Serving People</h3>
          <p className="text-lg text-gray-700">
            A community transformed by God's love and inspired to show His compassion.
          </p>
        </div>
        
        <p className="text-lg">
          At Rehoboth Christian Church, our vision is to be a community that loves God deeply and serves people 
          wholeheartedly. We envision a church family transformed by God's amazing love, where every person 
          experiences His grace and is inspired to extend that same compassion to others.
        </p>

        <h2 className="mt-8 font-bold text-2xl">Our Vision for the Future</h2>
        
        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-xl font-medium text-blue-700">A Thriving Faith Community</h3>
            <p className="mt-2">
              We envision Rehoboth Christian Church as a thriving community where people from all walks of life 
              come together to worship, grow, and serve. A place where the presence of God is tangible, and His 
              love transforms lives.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-medium text-blue-700">Spiritual Growth and Discipleship</h3>
            <p className="mt-2">
              We see a church deeply committed to discipleship, where believers are equipped and empowered to grow 
              in their faith and knowledge of God&apos;s Word, becoming mature followers of Christ who impact their 
              families, workplaces, and communities.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-medium text-blue-700">Compassionate Outreach</h3>
            <p className="mt-2">
              We envision being a church that reaches beyond its walls to meet the needs of our community, sharing 
              the love of Christ through acts of service and compassion, and being a beacon of hope to those who 
              are hurting or in need.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-medium text-blue-700">Multi-Generational Ministry</h3>
            <p className="mt-2">
              We see a church that ministers effectively to all generations, where children, youth, adults, and 
              seniors all find their place in the body of Christ and contribute their unique gifts and perspectives 
              to the work of the ministry.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-medium text-blue-700">Global Impact</h3>
            <p className="mt-2">
              We envision making a global impact through missions and partnerships, extending God&apos;s kingdom beyond 
              our local community to reach people around the world with the message of God&apos;s redeeming love.
            </p>
          </div>
        </div>
        
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
