import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sermon Series | Rehoboth Christian Church',
  description: 'Browse sermon series from Rehoboth Christian Church.',
};

export default function SermonSeriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}
