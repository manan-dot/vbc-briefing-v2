'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Newspaper, Archive, RefreshCw, LogOut } from 'lucide-react';
import { clearAuthentication } from '@/lib/storage';

interface HeaderProps {
  lastUpdated: Date | null;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function Header({ lastUpdated, onRefresh, isLoading }: HeaderProps) {
  const pathname = usePathname();

  const handleLogout = () => {
    clearAuthentication();
    window.location.reload();
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and title */}
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Newspaper className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">VBC Briefing</h1>
              <p className="text-xs text-gray-500">Value-Based Care News for Pear</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                pathname === '/'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Newspaper className="w-4 h-4" />
              Today
            </Link>
            <Link
              href="/archive"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                pathname === '/archive'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Archive className="w-4 h-4" />
              Archive
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Last updated */}
            {lastUpdated && (
              <span className="text-xs text-gray-400 hidden sm:block">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}

            {/* Refresh button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Refresh articles"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
