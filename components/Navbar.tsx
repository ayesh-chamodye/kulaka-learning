'use client';

import { useState } from 'react';
import Image from "next/image";
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Top-level navigation bar for Kulaka Learning.
 * Handles responsive layout, authentication-aware actions, and mobile menu state.
 */
export default function Navbar() {
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  /**
   * Determines whether a navigation link should be styled as active.
   * @param href - Target route to compare against the current pathname
   * @returns CSS class string for active state, or empty string when inactive
   */
  const isActive = (href: string) => pathname === href ? 'text-blue-600' : '';

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
            <>
              <Link href="/seller" className="hidden md:inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
                Seller Dashboard
              </Link>
              <Link href="/profile" className="hidden md:inline-block rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                Profile
              </Link>
              <button
                onClick={signOut}
                className="hidden md:inline-block rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Sign Out
              </button>
            </>
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
              <Link href="/cart" className={`block rounded px-3 py-2 ${isActive('/cart') ? 'text-blue-600' : 'text-gray-700 transition hover:text-blue-600'} md:p-0`}>
                Cart
              </Link>
            </li>
            <li>
              <Link href="/checkout" className={`block rounded px-3 py-2 ${isActive('/checkout') ? 'text-blue-600' : 'text-gray-700 transition hover:text-blue-600'} md:p-0`}>
                Checkout
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
