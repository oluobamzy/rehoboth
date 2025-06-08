import { motion } from 'framer-motion';
import Link from 'next/link';

export default function MissionComponent() {
  return (
    <div className="prose prose-lg max-w-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-lg">
          We are dedicated to sharing God's unconditional love and boundless mercy, inviting everyone into a transformative 
          relationship with Jesus Christ.
        </p>

        <p className="mt-4">
          No matter their background or circumstances, we provide opportunities for individuals to experience His grace 
          and be renewed in faith. Through prayer, worship, biblical teaching, and compassionate service, we foster a 
          vibrant faith community that reflects God's heart for the world.
        </p>

        <p className="mt-4">
          Rehoboth Christian Church is a place where people encounter His love, deepen their faith, and walk as 
          devoted followers of Christ.
        </p>

        <h2 className="mt-8 font-bold text-2xl">Our Objectives:</h2>
        
        <div className="mt-6 space-y-6">
          <div className="bg-gray-50 p-4 rounded-md shadow-sm">
            <h3 className="text-xl font-medium text-blue-700">Deepen Understanding of the Trinity</h3>
            <p className="mt-2">
              Deepen the understanding and belief in the Trinity—God the Father, Jesus Christ the Son, and the Holy 
              Spirit—acknowledging God's sovereignty and redemptive power.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-md shadow-sm">
            <h3 className="text-xl font-medium text-blue-700">Salvation Through Jesus Christ</h3>
            <p className="mt-2">
              Share the good news of Jesus Christ as the Savior and Redeemer, emphasizing His sacrifice for humanity's 
              sins and the promise of eternal life through faith in Him.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-md shadow-sm">
            <h3 className="text-xl font-medium text-blue-700">Guidance of the Holy Spirit</h3>
            <p className="mt-2">
              Foster an environment where the Holy Spirit is welcomed and embraced, leading individuals and the church 
              to spiritual maturity, discernment, and alignment with God's will.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-md shadow-sm">
            <h3 className="text-xl font-medium text-blue-700">Biblical Authority</h3>
            <p className="mt-2">
              Uphold the Bible as the sole and infallible Scripture, guiding the church in understanding God's will 
              and providing inspiration for Christian living.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-md shadow-sm">
            <h3 className="text-xl font-medium text-blue-700">Baptism and Spiritual Rebirth</h3>
            <p className="mt-2">
              Encourage and practice full immersion baptism as a symbolic act of death, burial, and resurrection in 
              Christ, signifying a union with God the Son and a commitment to fulfilling God's mission.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-md shadow-sm">
            <h3 className="text-xl font-medium text-blue-700">Promoting Equality</h3>
            <p className="mt-2">
              Embrace and preach the biblical principle of equality before God, recognizing and celebrating the 
              diversity within the human race as a reflection of God's power.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-md shadow-sm">
            <h3 className="text-xl font-medium text-blue-700">Discipleship and Spiritual Growth</h3>
            <p className="mt-2">
              Establish a culture of discipleship within the church, providing opportunities for spiritual growth, 
              education, and mentorship to empower individuals to become mature and effective followers of Christ.
            </p>
          </div>
        </div>

        <p className="mt-6">
          At Rehoboth Christian Church, we are committed to fulfilling these objectives as we seek to glorify God, 
          serve our community, and prepare for the return of our Lord and Savior, Jesus Christ.
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
