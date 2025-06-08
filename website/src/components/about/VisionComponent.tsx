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
          <p className="text-xl italic">
            "In Him we have redemption through His blood, the forgiveness of sins, according to the riches of His grace which He made to abound toward us in all wisdom and prudence."
          </p>
          <p className="font-bold text-right mt-2">- Ephesians 1:7-8</p>
        </div>
        
        <p className="text-lg">
          At Rehoboth Christian Church, our vision is rooted in <strong>Ephesians 1:7-8</strong>, which speaks of 
          God's abundant grace and the redemption found through Jesus Christ. We are called to share His boundless love 
          and mercy with all people, creating an environment where individuals experience spiritual transformation 
          and a deep connection with God.
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
              in their faith and knowledge of God's Word, becoming mature followers of Christ who impact their 
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
              We envision making a global impact through missions and partnerships, extending God's kingdom beyond 
              our local community to reach people around the world with the message of God's redeeming love.
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
