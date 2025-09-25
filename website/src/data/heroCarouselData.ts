// src/data/heroCarouselData.ts
export interface HeroCarouselItem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  image?: string;
  video?: string;
  ctas: {
    primary?: {
      text: string;
      link: string;
      variant: 'primary' | 'secondary';
    };
    secondary?: {
      text: string;
      link: string;
      variant: 'outline' | 'ghost';
    };
  };
  overlay?: {
    gradient: string;
    opacity: number;
  };
  textPosition: 'left' | 'center' | 'right';
  theme: 'light' | 'dark';
}

export const HeroCarousels: HeroCarouselItem[] = [
  {
    id: 'welcome-home',
    title: 'Welcome Home to Rehoboth',
    subtitle: 'A Place Where Faith Meets Family',
    description: 'Experience authentic worship, genuine community, and transformative faith in the heart of our vibrant church family. Join us every Sunday as we grow together in God\'s love.',
    image: 'https://images.unsplash.com/photo-1438034884650-4fb4ad0c9b10?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    ctas: {
      primary: {
        text: 'Visit This Sunday',
        link: '/visit',
        variant: 'primary'
      },
      secondary: {
        text: 'Learn About Us',
        link: '/about',
        variant: 'outline'
      }
    },
    overlay: {
      gradient: 'linear-gradient(135deg, rgba(30, 58, 138, 0.85) 0%, rgba(16, 185, 129, 0.75) 100%)',
      opacity: 0.9
    },
    textPosition: 'left',
    theme: 'dark'
  },
  {
    id: 'sunday-worship',
    title: 'Sunday Worship Experience',
    subtitle: 'Every Sunday at 10:00 AM',
    description: 'Join our vibrant worship service featuring contemporary music, inspiring messages, and a warm, welcoming atmosphere for the whole family.',
    image: '/pastoral_care.jpeg',
    ctas: {
      primary: {
        text: 'Watch Live Stream',
        link: '/media/live-stream',
        variant: 'primary'
      },
      secondary: {
        text: 'Service Times',
        link: '/events',
        variant: 'outline'
      }
    },
    overlay: {
      gradient: 'linear-gradient(45deg, rgba(59, 130, 246, 0.8) 0%, rgba(16, 185, 129, 0.7) 100%)',
      opacity: 0.85
    },
    textPosition: 'center',
    theme: 'dark'
  },
  {
    id: 'community-outreach',
    title: 'Serving Our Community',
    subtitle: 'Making a Difference Together',
    description: 'Be part of something bigger. Our community outreach programs touch lives through food banks, youth mentorship, and neighborhood transformation initiatives.',
    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    ctas: {
      primary: {
        text: 'Get Involved',
        link: '/get-involved/volunteering',
        variant: 'primary'
      },
      secondary: {
        text: 'View Programs',
        link: '/ministries',
        variant: 'outline'
      }
    },
    overlay: {
      gradient: 'linear-gradient(225deg, rgba(16, 185, 129, 0.85) 0%, rgba(34, 197, 94, 0.75) 100%)',
      opacity: 0.8
    },
    textPosition: 'right',
    theme: 'dark'
  },
  {
    id: 'youth-ministry',
    title: 'Next Generation Leaders',
    subtitle: 'Youth & Children\'s Ministry',
    description: 'Empowering young hearts and minds through dynamic programs, mentorship, and fun activities that build character and strengthen faith.',
    image: 'https://images.unsplash.com/photo-1544717299-70d43ebe2d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    ctas: {
      primary: {
        text: 'Youth Programs',
        link: '/ministries/youth',
        variant: 'primary'
      },
      secondary: {
        text: 'Children\'s Corner',
        link: '/ministries/children',
        variant: 'outline'
      }
    },
    overlay: {
      gradient: 'linear-gradient(315deg, rgba(99, 102, 241, 0.8) 0%, rgba(16, 185, 129, 0.7) 100%)',
      opacity: 0.85
    },
    textPosition: 'left',
    theme: 'dark'
  },
  {
    id: 'pastor-message',
    title: 'A Message of Hope',
    subtitle: 'From Pastor Patrick & Family',
    description: 'Discover God\'s purpose for your life through powerful biblical teaching, pastoral care, and a community that celebrates your journey of faith.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    ctas: {
      primary: {
        text: 'Meet Our Pastor',
        link: '/about#pastor',
        variant: 'primary'
      },
      secondary: {
        text: 'Latest Sermons',
        link: '/sermons',
        variant: 'outline'
      }
    },
    overlay: {
      gradient: 'linear-gradient(180deg, rgba(30, 58, 138, 0.9) 0%, rgba(59, 130, 246, 0.7) 100%)',
      opacity: 0.85
    },
    textPosition: 'center',
    theme: 'dark'
  }
];