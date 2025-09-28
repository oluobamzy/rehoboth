import { motion } from 'framer-motion';
import Link from 'next/link';

export default function StatementOfFaithComponent() {
  return (
    <div className="prose prose-lg max-w-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Statement of Faith Header */}
        <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-500 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-purple-700">Our Faith Statement</h2>
          <p className="text-lg text-gray-700">
            These are the fundamental beliefs that guide our church and define our Christian faith.
          </p>
        </div>

        <div className="space-y-6">
          {/* 1. God */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-blue-800 mb-3">1. God</h3>
            <p className="text-gray-700">
              There is one God,¹ who is infinitely perfect,² existing eternally in three persons: Father, 
              Son and Holy Spirit.³
            </p>
          </div>

          {/* 2. Jesus */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-blue-800 mb-3">2. Jesus</h3>
            <p className="text-gray-700">
              Jesus Christ is true God and true man.⁴ He was conceived by the Holy Spirit and born of 
              the Virgin Mary.⁵ He died upon the cross, the Just for the unjust, as a substitutionary sacrifice, 
              and all who believe in Him are justified on the ground of His shed blood. He arose from the dead 
              according to the Scriptures.⁶ He is now at the right hand of the Majesty on high as our great High 
              Priest.⁷ He will come again to establish His kingdom of righteousness and peace.⁸
            </p>
          </div>

          {/* 3. Holy Spirit */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-blue-800 mb-3">3. Holy Spirit</h3>
            <p className="text-gray-700">
              The Holy Spirit is a divine Person, sent to indwell,⁹ guide, teach and empower the 
              believer, and to convince the world of sin, of righteousness and of judgment.¹⁰
            </p>
          </div>

          {/* 4. Bible */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-blue-800 mb-3">4. Bible</h3>
            <p className="text-gray-700">
              The Old and New Testaments, inerrant as originally given, were verbally inspired by God 
              and are a complete revelation of His will for the salvation of people. They constitute the divine 
              and only rule of Christian faith and practice.¹¹
            </p>
          </div>

          {/* 5. Sin */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-blue-800 mb-3">5. Sin</h3>
            <p className="text-gray-700">
              Humankind, originally created in the image and likeness of God,¹² fell through 
              disobedience, incurring thereby both physical and spiritual death. All people are born with a 
              sinful nature, are separated from the life of God, and can be saved only through the atoning 
              work of the Lord Jesus Christ.¹³ The destiny of the impenitent and unbelieving is existence 
              forever in conscious torment, but that of the believer is everlasting joy and bliss.¹⁴
            </p>
          </div>

          {/* 6. Freedom from Sin */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-blue-800 mb-3">6. Freedom from Sin</h3>
            <p className="text-gray-700">
              Salvation has been provided only through Jesus Christ. Those who repent 
              and believe in Him are united with Christ through the Holy Spirit and are thereby regenerated 
              (born again), justified, sanctified and granted the gift of eternal life as adopted children of God.¹⁵
            </p>
          </div>

          {/* 7. Christian Living */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-blue-800 mb-3">7. Christian Living</h3>
            <p className="text-gray-700 mb-3">
              It is the will of God that in union with Christ each believer should be sanctified 
              thoroughly¹⁶ thereby being separated from sin and the world and fully dedicated to God, receiving power for holy living and sacrificial and effective service toward the completion of 
              Christ's commission.¹⁷
            </p>
            <p className="text-gray-700">
              This is accomplished through being filled with the Holy Spirit which is both a distinct event and 
              progressive experience in the life of the believer.¹⁸
            </p>
          </div>

          {/* 8. Healing */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-blue-800 mb-3">8. Healing</h3>
            <p className="text-gray-700">
              Provision is made in the redemptive work of the Lord Jesus Christ for the healing of 
              the mortal body. Prayer for the sick and anointing with oil as taught in the Scriptures are 
              privileges for the Church in this present age.¹⁹
            </p>
          </div>

          {/* 9. Church */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-blue-800 mb-3">9. Church</h3>
            <p className="text-gray-700 mb-3">
              The universal Church, of which Christ is the Head, consists of all those who believe on 
              the Lord Jesus Christ, are redeemed through His blood, regenerated by the Holy Spirit, and 
              commissioned by Christ to go into all the world as a witness, preaching the Gospel to all 
              nations.²⁰
            </p>
            <p className="text-gray-700">
              The local church, the visible expression of the universal Church, is a body of believers 
              in Christ who are joined together to worship God, to observe the ordinances of Baptism and the 
              Lord's Supper, to pray, to be edified through the Word of God, to fellowship, and to testify in 
              word and deed to the good news of salvation both locally and globally. The local church enters 
              into relationships with other like-minded churches for accountability, encouragement and 
              mission.²¹
            </p>
          </div>

          {/* 10. Life after death */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-blue-800 mb-3">10. Life after death</h3>
            <p className="text-gray-700">
              There shall be a bodily resurrection of the just and of the unjust; for the 
              former, a resurrection unto life;²² for the latter, a resurrection unto judgment.²³
            </p>
          </div>

          {/* 11. Second Coming of Christ */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-blue-800 mb-3">11. Second Coming of Christ</h3>
            <p className="text-gray-700">
              The second coming of the Lord Jesus Christ is imminent and will be 
              personal and visible.²⁴ As the believer's blessed hope, this vital truth is an incentive for holy living 
              and sacrificial service toward the completion of Christ's commission.²⁵
            </p>
          </div>
        </div>

        {/* Scripture References */}
        <div className="mt-12 bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Scripture References</h3>
          <div className="text-sm text-gray-600 space-y-1 leading-relaxed">
            <p><strong>1.</strong> Isaiah 44:6; 45:5-6 | <strong>2.</strong> Matthew 5:48; Deut. 32:4 | <strong>3.</strong> Matthew 3:16-17; 28:19 | <strong>4.</strong> Philippians 2:6-11; Hebrews 2:14-18; Colossians 2:9 | <strong>5.</strong> Matthew 1:18; Luke 1:35 | <strong>6.</strong> 1 Corinthians 15:3-5; 1 John 2:2; Acts 13:39 | <strong>7.</strong> Hebrews 4:14-15; 9:24-28 | <strong>8.</strong> Matthew 25:31-34; Acts 1:11 | <strong>9.</strong> John 14:16-17 | <strong>10.</strong> John 16:7-11; 1 Corinthian 2:10-12 | <strong>11.</strong> 2 Timothy 3:16; 2 Peter 1:20-21 | <strong>12.</strong> Genesis 1:27 | <strong>13.</strong> Romans 8:8; 1 John 2:2 | <strong>14.</strong> Matthew 25:41-46; 2 Thessalonians 1:7-10 | <strong>15.</strong> Titus 3:5-7; Acts 2:38; John 1:12; 1 Corinthians 6:11 | <strong>16.</strong> 1 Thessalonians 5:23 | <strong>17.</strong> Acts 1:8 | <strong>18.</strong> Romans 12:1-2; Galatians 5:16-25 | <strong>19.</strong> Matthew 8:16-17; James 5:13-16 | <strong>20.</strong> Ephesians 3:6-12; 1:22-23 | <strong>21.</strong> Acts 2:41-47; Hebrew 10:25; Matthew 28:19-20; Acts 1:8, 11:19-30; 15 | <strong>22.</strong> 1 Corinthians 15:20-23 | <strong>23.</strong> 2 Thessalonians 1:7-10 | <strong>24.</strong> 1 Thessalonians 4:13-17 | <strong>25.</strong> 1 Corinthians 1:7; Titus 2:11-14; Matthew 24:14; 28:18-20</p>
          </div>
        </div>

        <p className="mt-8 font-medium text-center">
          These statements of faith represent the biblical foundation upon which Rehoboth Christian Church 
          is built and by which we seek to live and minister.
        </p>

        <div className="mt-10 flex justify-center">
          <Link href="/contact" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
            Learn More About Our Beliefs
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}