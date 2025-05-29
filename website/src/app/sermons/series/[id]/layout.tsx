// Note: This is a server component, but we can't get dynamic metadata since 
// we converted the page to a client component. We'll need to use a static title.
export const metadata = {
  title: 'Sermon Series | Rehoboth Christian Church',
  description: 'View sermon series details and recordings',
};

export default function SermonSeriesDetailLayout({
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
