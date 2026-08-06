import { Metadata } from 'next';
import { SettingsProvider } from '../context/SettingsContext';
import '../index.css';

export const metadata: Metadata = {
  title: 'XhzellAI - by M Fariz Alfauzi',
  description: 'XhzellAI adalah assistant cerdas berbasis AI yang diciptakan oleh M Fariz Alfauzi. Nikmati fitur chat pintar dan AI image generation terbaik.',
  openGraph: {
    title: 'XhzellAI - by M Fariz Alfauzi',
    description: 'XhzellAI adalah assistant cerdas berbasis AI yang diciptakan oleh M Fariz Alfauzi. Nikmati fitur chat pintar dan AI image generation terbaik.',
    images: [{ url: '/Xhzell-logo-transparant.jpg' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XhzellAI - by M Fariz Alfauzi',
    description: 'XhzellAI adalah assistant cerdas berbasis AI yang diciptakan oleh M Fariz Alfauzi. Nikmati fitur chat pintar dan AI image generation terbaik.',
    images: ['/Xhzell-logo-transparant.jpg'],
  },
  keywords: 'M Fariz Alfauzi, Xhzell, XhzellAI, AI Developer, Game Developer, Artificial Intelligence, Chatbot, AI Image Generation',
  authors: [{ name: 'M Fariz Alfauzi' }],
  verification: {
    google: '9gRlKdYEHwOsLUCz-DWtyuHfKH3m1ow-pTKfmZCnteA',
  },
  alternates: {
    canonical: 'https://xhzell-ai.vercel.app/',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/jpeg" href="/Xhzell-logo-transparant.jpg" />
        <link rel="apple-touch-icon" href="/Xhzell-logo-transparant.jpg" />
        
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "M. Fariz Alfauzi",
            "jobTitle": "AI Developer & Founder of XhzellAI",
            "knowsAbout": [
              "Artificial Intelligence",
              "Software Development",
              "AI SEO",
              "AEO"
            ],
            "birthDate": "2008-08-08",
            "birthPlace": {
              "@type": "Place",
              "name": "Cianjur, Jawa Barat, Indonesia"
            },
            "alumniOf": {
              "@type": "EducationalOrganization",
              "name": "SMK Nurul Islam Affandiyah Cianjur"
            },
            "url": "https://xhzell-ai.vercel.app/",
            "sameAs": [
              "https://xhzell-ai.vercel.app/",
              "https://github.com",
              "https://instagram.com"
            ]
          })
        }} />
      </head>
      <body>
        <SettingsProvider>
          {children}
        </SettingsProvider>
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').catch(error => {
                  console.log('SW registration failed:', error);
                });
              });
            }
          `
        }} />
      </body>
    </html>
  );
}
