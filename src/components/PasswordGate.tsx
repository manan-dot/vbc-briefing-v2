'use client';

import { useState, useEffect } from 'react';
import { setAuthenticated, isAuthenticated } from '@/lib/storage';
import { Lock, LogIn } from 'lucide-react';

interface PasswordGateProps {
  children: React.ReactNode;
}

export default function PasswordGate({ children }: PasswordGateProps) {
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check authentication status on mount
    setIsAuthed(isAuthenticated());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate email ends with @pearwith.us
    const emailLower = email.toLowerCase().trim();
    if (!emailLower.endsWith('@pearwith.us')) {
      setError('Please use your @pearwith.us email address');
      setIsLoading(false);
      return;
    }

    // Simple honor system - just check domain
    setTimeout(() => {
      setAuthenticated(true);
      setIsAuthed(true);
      setIsLoading(false);
    }, 500);
  };

  // Loading state while checking auth
  if (isAuthed === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  // Authenticated - show content
  if (isAuthed) {
    return <>{children}</>;
  }

  // Not authenticated - show login form
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Lock className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">VBC Briefing</h1>
          <p className="text-gray-500">For Pear Health employees only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Work Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@pearwith.us"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              required
              autoFocus
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="animate-pulse">Verifying...</span>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Access Briefing
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Honor system authentication. Please use your Pear email.
        </p>
      </div>
    </div>
  );
}
