import { Metadata } from 'next';
import EventList from '@/components/events/EventList';

export const metadata: Metadata = {
  title: 'Church Events',
  description: 'Browse and register for upcoming events at Rehoboth Christian Church',
};

export default function EventsPage() {
  return <EventList />;
}
