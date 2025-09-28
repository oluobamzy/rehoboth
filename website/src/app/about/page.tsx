'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import AboutContent from '@/components/about/AboutContent';
import MissionComponent from '@/components/about/MissionComponent';
import VisionComponent from '@/components/about/VisionComponent';
import StatementOfFaithComponent from '@/components/about/StatementOfFaithComponent';
import TabButton from '@/components/ui/TabButton';

function AboutPageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'about' | 'mission' | 'vision' | 'faith'>('about');

  // Set the active tab based on URL parameter
  useEffect(() => {
    if (tabParam === 'mission') {
      setActiveTab('mission');
    } else if (tabParam === 'vision') {
      setActiveTab('vision');
    } else if (tabParam === 'faith') {
      setActiveTab('faith');
    } else {
      setActiveTab('about');
    }
  }, [tabParam]);

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">About Rehoboth Christian Church</h1>
        
        {/* Tab navigation */}
        <div className="flex justify-center mb-8 border-b">
          <TabButton 
            active={activeTab === 'about'} 
            onClick={() => setActiveTab('about')}
          >
            About Us
          </TabButton>
          <TabButton 
            active={activeTab === 'mission'} 
            onClick={() => setActiveTab('mission')}
          >
            Our Mission
          </TabButton>
          <TabButton 
            active={activeTab === 'vision'} 
            onClick={() => setActiveTab('vision')}
          >
            Our Vision
          </TabButton>
          <TabButton 
            active={activeTab === 'faith'} 
            onClick={() => setActiveTab('faith')}
          >
            Statement of Faith
          </TabButton>
        </div>
        
        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="mx-auto"
        >
          {activeTab === 'about' && <AboutContent />}
          {activeTab === 'mission' && <MissionComponent />}
          {activeTab === 'vision' && <VisionComponent />}
          {activeTab === 'faith' && <StatementOfFaithComponent />}
        </motion.div>
      </div>
    </main>
  );
}

export default function AboutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AboutPageContent />
    </Suspense>
  );
}
