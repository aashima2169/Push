// app/layout.jsx
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

export const metadata = {
  title: 'Push — think deeper, not faster',
  description: 'The opposite of autocomplete. An AI that interrupts your thinking with uncomfortable questions instead of finishing your sentences.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Inter+Tight:wght@300..700&display=swap"
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
