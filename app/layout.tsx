import './global.css';

export const metadata = {
  title: 'Shipy - Maritime Fleet Management',
  description: 'One Platform, Global Visibility.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}