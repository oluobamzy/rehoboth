import HeroCarousel from "@/components/hero/HeroCarousel";
import MainLayout from "@/components/common/MainLayout";
import Link from "next/link";

export default function Home() {
  return (
    <MainLayout>
      <HeroCarousel />
      <div className="container mx-auto px-4 py-8">
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Welcome to Rehoboth Christian Church</h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg mb-4">
              Join us for worship and fellowship as we grow together in faith. We are a community committed to following Jesus Christ and serving our neighbors.
            </p>
            <p className="text-lg mb-4">
              Whether you're seeking spiritual growth, community connection, or a place to belong, we invite you to be part of our church family.
            </p>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-3 text-blue-600">Sunday Services</h3>
            <p className="mb-4">Join us every Sunday at 10:00 AM for worship, prayer, and fellowship.</p>
            <Link href="/events" className="text-blue-600 hover:underline">View Schedule →</Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-3 text-blue-600">Latest Sermons</h3>
            <p className="mb-4">Listen to our recent messages and grow in your understanding of God's Word.</p>
            <Link href="/sermons" className="text-blue-600 hover:underline">Listen Now →</Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-3 text-blue-600">Get Involved</h3>
            <p className="mb-4">Discover opportunities to serve, connect, and make a difference in our community.</p>
            <Link href="/ministries" className="text-blue-600 hover:underline">Learn More →</Link>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
