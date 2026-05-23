// app/layout.jsx
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

export const metadata = {
  title: 'Push — help me think better',
  description: 'The opposite of autocomplete. An AI that tells you where you actually thought, and where you just typed.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
