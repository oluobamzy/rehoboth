import { Metadata } from 'next';
import EventDetail from '@/components/events/EventDetail';

export const metadata: Metadata = {
  title: 'Event Details',
  description: 'View details and register for this church event',
};

export default function EventDetailsPage() {
  return <EventDetail />;
}
