'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MenuItem {
  label: string;
  href: string;
  icon: string;
}

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  
  const menuItems: MenuItem[] = [
    { label: 'Startsida', href: '/', icon: '🏠' },
    { label: 'Sök kandidater', href: '/employer/directory', icon: '👥' },
    { label: 'Sparade', href: '/employer/saved', icon: '❤️' },
    { label: 'Min profil', href: '/employer/profile', icon: '👤' },
    { label: 'Meddelanden', href: '/messages', icon: '💬' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-[var(--border)] rounded-lg shadow-md"
        aria-label="Öppna meny"
      >
        <svg className="w-6 h-6 text-[var(--brand-navy)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Panel */}
      <div className={`lg:hidden fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 pt-16">
          <div className="mb-6 pb-4 border-b border-[var(--border)]">
            <h2 className="text-lg font-bold text-[var(--brand-navy)]">📋 Arbetspoolen</h2>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-[#e6f1fb] text-[var(--brand)] font-semibold' 
                      : 'text-[var(--brand-navy)] hover:bg-[var(--surface)]'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          
          <div className="mt-8 pt-4 border-t border-[var(--border)]">
            <Link
              href="/api/auth/logout"
              className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
            >
              <span className="text-xl">🚪</span>
              <span>Logga ut</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
