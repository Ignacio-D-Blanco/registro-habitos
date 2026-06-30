import './globals.css'; 
import type { Metadata } from 'next';
import Sidebar from '../components/Sidebar'; 

export const metadata: Metadata = {
  title: 'Pulse Habits',
  description: 'Habit Tracker Engine',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="bg-[#0F0F13] text-white antialiased min-h-screen flex">
        <Sidebar />
        <div className="flex-1 overflow-y-auto max-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}