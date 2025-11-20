'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  { name: 'Dashboard', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Crash Timeline', href: '/crash-timeline' },
  { name: 'AI Picks', href: '/ai-picks' },
  { name: 'Newsletter', href: '/newsletter' },
  { name: 'Contact Us', href: '/contact' },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-slate-700/50 backdrop-blur-sm border-b border-slate-600 sticky top-[88px] z-[35]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
                    'hover:bg-slate-600/50 hover:text-white',
                    isActive
                      ? 'bg-slate-600 text-white'
                      : 'text-slate-300'
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-600/50 rounded-md transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-600 py-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'block px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    'hover:bg-slate-600/50 hover:text-white',
                    isActive
                      ? 'bg-slate-600 text-white'
                      : 'text-slate-300'
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}

