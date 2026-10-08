'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Top-level navigation bar for Kulaka Learning.
 * Handles responsive layout, authentication-aware actions, and mobile menu state.
 */
export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  /**
   * Determines whether a navigation link should be styled as active.
   * @param href - Target route to compare against the current pathname
   * @returns CSS class string for active state, or empty string when inactive
   */
  const isActive = (href: string) => pathname === href ? 'text-blue-600' : '';

  const displayName = profile?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.picture || null;

  return (
    <nav className="fixed top-0 start-0 z-20 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4">
        {/* Logo */}
        <a href="/" className="flex items-center space-x-3">
          <Image src="/assets/images/kulaka.png" alt="Kulaka Learning Logo" width={32} height={32} unoptimized style={{ height: '2rem', width: '2rem' }} />
        </a>

        {/* Actions */}
        <div className="flex items-center space-x-3 md:order-2">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-gray-200 p-1 transition hover:bg-gray-50"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                    {displayName[0]?.toUpperCase()}
                  </div>
                )}
                <span className="hidden md:block text-sm font-medium text-gray-700">{displayName}</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-100 bg-white py-2 shadow-lg">
                  <div className="px-4 py-2">
                    <p className="text-sm font-medium text-gray-900">{displayName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <div className="h-px bg-gray-100" />
                  {profile?.role === 'instructor' && (
                    <Link href="/seller" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropdownOpen(false)}>
                      Seller Dashboard
                    </Link>
                  )}
                  <Link href="/library" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropdownOpen(false)}>
                    My Library
                  </Link>
                  <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropdownOpen(false)}>
                    Profile
                  </Link>
                  <div className="h-px bg-gray-100" />
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      signOut();
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
              Sign In
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 md:hidden"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <div className={`${mobileOpen ? 'flex' : 'hidden'} w-full items-center justify-between md:order-1 md:flex md:w-auto`}>
          <ul className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-white p-4 font-medium md:flex-row md:gap-8 md:border-0 md:p-0">
            <li>
              <Link href="/" className={`block rounded px-3 py-2 ${isActive('/') ? 'text-blue-600' : 'text-gray-700 transition hover:text-blue-600'} md:p-0`}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/#courses" className={`block rounded px-3 py-2 ${isActive('/#courses') ? 'text-blue-600' : 'text-gray-700 transition hover:text-blue-600'} md:p-0`}>
                Videos
              </Link>
            </li>
            <li>
              <Link href="/library" className={`block rounded px-3 py-2 ${isActive('/library') ? 'text-blue-600' : 'text-gray-700 transition hover:text-blue-600'} md:p-0`}>
                Library
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
