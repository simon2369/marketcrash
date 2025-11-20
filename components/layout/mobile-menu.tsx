'use client';

import { useState } from 'react';
import { X, Menu } from 'lucide-react';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'indicators', label: '📊 Indicators', href: '#indicators' },
    { id: 'timeline', label: '📅 Timeline', href: '#timeline' },
    { id: 'charts', label: '📈 Charts', href: '#charts' },
    { id: 'news', label: '📰 News', href: '#news' },
    { id: 'alerts', label: '🔔 Alerts', href: '#alerts' },
  ];

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="lg:hidden">
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 p-3 bg-slate-800 rounded-lg border border-slate-700 text-white hover:bg-slate-700 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Slide-out Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="fixed inset-y-0 right-0 w-64 bg-slate-900 z-40 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white">Menu</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={handleLinkClick}
                  className="block px-4 py-3 text-lg text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}

