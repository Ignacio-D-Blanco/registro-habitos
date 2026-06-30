'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Hábitos', href: '/habits', icon: '✅' },
    { name: 'Calendario', href: '/calendar', icon: '📅' },
    { name: 'Insights', href: '/insights', icon: '💡' },
    { name: 'Estadísticas', href: '/stats', icon: '📈' },
    { name: 'Configuración', href: '/settings', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-[#0F0F13] border-r border-[#313142]/60 flex flex-col justify-between h-screen p-6 sticky top-0 left-0 z-50">
      <div className="space-y-8">

        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center text-lg">
            ⚡
          </div>
          <span className="font-bold text-lg tracking-wide text-white">Pulse Habits</span>
        </div>

        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-brand text-white shadow-lg shadow-[#4B208C]/20' 
                    : 'text-[#A0A0AB] hover:bg-[#1A1A24] hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-[#313142]/40 pt-4 flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1A1A24] border border-[#313142] flex items-center justify-center text-base">
            👤
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">Ignacio</span>
            <span className="text-xs text-[#A0A0AB]">Ver perfil</span>
          </div>
        </div>
        <button className="text-[#A0A0AB] hover:text-white text-xs bg-[#1A1A24] p-2 rounded-lg border border-[#313142]">↩</button>
      </div>
    </aside>
  );
}