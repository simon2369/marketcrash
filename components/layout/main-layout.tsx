'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { Navbar } from './navbar';
import { AlertTopBar } from '@/components/alert-top-bar';
import { CombinedEconomicIndicators } from '@/hooks/use-economic-indicators';

interface MainLayoutProps {
  children: ReactNode;
  showAlerts?: boolean;
  indicators?: CombinedEconomicIndicators;
}

export function MainLayout({ children, showAlerts = false, indicators }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 p-6 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl flex justify-between items-center">
          <Link href="/">
            <h1 className="text-3xl font-bold text-white hover:text-slate-200 transition-colors cursor-pointer">
              📊 Market Crash Monitor
            </h1>
          </Link>
          
          <ThemeToggle />
        </div>
      </header>

      {/* Navigation Bar */}
      <Navbar />

      {/* Alert Top Bar - Only show on home page */}
      {showAlerts && indicators && (
        <div className="sticky top-[150px] z-30 w-full">
          <AlertTopBar indicators={indicators} />
        </div>
      )}

      {/* Main Content */}
      {children}
    </div>
  );
}

