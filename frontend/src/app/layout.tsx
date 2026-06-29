import './globals.css';

export const metadata = {
  title: 'Generic Habit Tracker',
  description: 'Sistema dinámico de registro y visualización',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased bg-background text-textPrimary">
        {children}
      </body>
    </html>
  );
}
