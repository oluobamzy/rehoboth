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
    image: '/pastoral_care.jpeg',
    ctas: {
      primary: {
        text: 'Visit This Sunday',
        link: '/about',
        variant: 'primary'
      },
      secondary: {
        text: 'Learn About Us',
        link: '/about',
        variant: 'outline'
      }
    },
    overlay: {
      gradient: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.5) 100%)',
      opacity: 0.8
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
      gradient: 'linear-gradient(45deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.5) 100%)',
      opacity: 0.8
    },
    textPosition: 'center',
    theme: 'dark'
  },
  {
    id: 'youth-ministry',
    title: 'Next Generation Leaders',
    subtitle: 'Youth & Children\'s Ministry',
    description: 'Empowering young hearts and minds through dynamic programs, mentorship, and fun activities that build character and strengthen faith.',
    image: '/children%27s%20corner2.jpeg',
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
      gradient: 'linear-gradient(315deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.5) 100%)',
      opacity: 0.8
    },
    textPosition: 'left',
    theme: 'dark'
  },
  {
    id: 'pastor-message',
    title: 'A Message of Hope',
    subtitle: 'From Pastor Patrick & Family',
    description: 'Discover God\'s purpose for your life through powerful biblical teaching, pastoral care, and a community that celebrates your journey of faith.',
    image: '/PastorPatrick%26wife.jpg',
    ctas: {
      primary: {
        text: 'Meet Our Pastor',
        link: '/contact',
        variant: 'primary'
      },
      secondary: {
        text: 'Latest Sermons',
        link: '/sermons',
        variant: 'outline'
      }
    },
    overlay: {
      gradient: 'linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.5) 100%)',
      opacity: 0.8
    },
    textPosition: 'center',
    theme: 'dark'
  }
];