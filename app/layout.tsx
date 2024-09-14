import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { NowPlaying } from './now-playing';
import { AllPlaylists } from './all-playlists';

export const metadata: Metadata = {
  title: 'My Music',
};

export const viewport: Viewport = {
  maximumScale: 1,
};

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="dark flex flex-col md:flex-row h-screen text-gray-200 bg-[#0A0A0A]">
        <AllPlaylists />
        {children}
        <NowPlaying />
      </body>
    </html>
  );
}
