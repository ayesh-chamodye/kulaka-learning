'use client';

import Image from "next/image";

/**
 * Site footer displayed on marketing and app pages.
 * Shows brand logo and copyright notice with the current year.
 */
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-gray-100 bg-white py-12">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-3">
            <img
              src="/assets/images/kulaka.png"
              alt="Kulaka Learning"
              width={28}
              height={28}
              className="h-7 w-7"
            />
            <span className="text-lg font-bold text-slate-900">Kulaka Learning</span>
          </div>
          <div className="text-muted text-sm">
            © {year} Kulaka Learning. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
