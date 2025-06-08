import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AboutContent() {
  return (
    <div className="prose prose-lg max-w-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-lg">
          Rehoboth Christian Church is a vibrant community of faith dedicated to sharing the life-transforming 
          message of the gospel of Jesus Christ. Established in 2022 in Ottawa, our church is built upon 
          the foundation of Ephesians 1:7: "In Him, we have redemption through His blood, the forgiveness 
          of sins, according to the riches of His grace."
        </p>

        <p className="mt-4">
          At Rehoboth Christian Church, we believe in the power of God's love to redeem, restore, and renew 
          lives. Our mission is to proclaim His love by fostering a Christ-centered community where individuals 
          grow in faith, experience His boundless grace, and extend that love to others. Through sound biblical 
          teaching, heartfelt worship, and a strong commitment to discipleship, we strive to nurture spiritual 
          growth and deepen our relationship with God.
        </p>

        <p className="mt-4">
          We are dedicated to making a lasting impact for God's kingdom by bringing hope, healing, and restoration 
          to all who seek Him. Whether you are new to the faith or have been walking with Christ for years, 
          Rehoboth Christian Church is a place where you can belong, grow, and serve. We welcome you to join 
          us on this journey of faith as we seek to glorify God and live out His purpose in our lives.
        </p>

        <h2 className="mt-8 font-bold text-2xl">Our Core Values:</h2>
        <ul className="mt-4 space-y-2">
          <li><strong>Faith</strong> – Anchored in the Word of God, we grow in faith and trust in His promises.</li>
          <li><strong>Grace</strong> – We embrace the unconditional love and mercy of Christ, sharing it with others.</li>
          <li><strong>Community</strong> – A welcoming family of believers supporting one another in love and prayer.</li>
          <li><strong>Discipleship</strong> – Committed to spiritual growth through biblical teaching and mentorship.</li>
          <li><strong>Service</strong> – Living out our faith by serving God and our community with compassion.</li>
        </ul>

        <p className="mt-6 font-medium">
          Join us at Rehoboth Christian Church, where faith flourishes, love abounds, and lives are transformed 
          by the power of the gospel.
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
