'use client';

const AUTH_KEY = 'vbc_briefing_auth';
const SELECTED_KEY = 'vbc_briefing_selected';

// Authentication helpers
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUTH_KEY) === 'true';
}

export function setAuthenticated(value: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_KEY, value ? 'true' : 'false');
}

export function clearAuthentication(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_KEY);
}

// Selected articles helpers (persists selection across page refresh)
export function getSelectedIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(SELECTED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function setSelectedIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SELECTED_KEY, JSON.stringify(ids));
}

export function clearSelectedIds(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SELECTED_KEY);
}
