'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

/**
 * Mapping of supported video identifiers to their display metadata and prices.
 */
const COURSES = {
  'web-dev': { title: 'Web Development Bootcamp', price: 49 },
  'data-science': { title: 'Data Science Fundamentals', price: 59 },
  'ui-ux': { title: 'UI/UX Design Mastery', price: 39 },
  'mobile-app': { title: 'Mobile App Development', price: 69 },
  'marketing': { title: 'Digital Marketing Pro', price: 44 },
  'cloud': { title: 'Cloud Computing Essentials', price: 79 },
};

export const dynamic = 'force-dynamic';

/**
 * Checkout page for mock video purchase.
 * Collects contact and payment details, then redirects to the watch page.
 */
export default function Checkout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoParam = searchParams.get('video');
  const course = videoParam && videoParam in COURSES ? COURSES[videoParam as keyof typeof COURSES] : null;
  const item = course;
  const [processing, setProcessing] = useState(false);

  /**
   * Handles checkout form submission.
   * Prevents default form behavior, simulates processing, then navigates to the watch page.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      router.push(`/watch/${videoParam}`);
    }, 800);
  };

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-screen-xl px-4 py-12">
          <div className="learning-card p-12 text-center">
            <p className="section-description mb-6 text-lg">No item selected for checkout.</p>
            <a href="/#courses" className="btn-primary px-6 py-3">
              Browse Videos
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-screen-xl px-4 py-12">
        <h1 className="section-title mb-8 text-3xl font-bold md:text-4xl">Checkout</h1>
        <div className="grid gap-8 lg:grid-cols-3">
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            <div className="learning-card p-6">
              <h3 className="section-title mb-4 text-lg font-bold">Contact</h3>
              <input
                type="email"
                required
                placeholder="Email address"
                className="learning-input"
              />
            </div>

            <div className="learning-card p-6">
              <h3 className="section-title mb-4 text-lg font-bold">Payment</h3>
              <input
                type="text"
                required
                placeholder="Card number"
                className="learning-input mb-4"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  placeholder="MM / YY"
                  className="learning-input"
                />
                <input
                  type="text"
                  required
                  placeholder="CVC"
                  className="learning-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="btn-primary w-full px-6 py-3 text-base"
            >
              {processing ? 'Processing...' : `Pay $${item.price}`}
            </button>
          </form>

          <div className="lg:col-span-1">
            <div className="learning-card p-6">
              <h3 className="section-title mb-4 text-lg font-bold">Order Summary</h3>
              <div className="mb-4">
                <p className="font-medium">{item.title}</p>
                <p className="text-muted text-sm">One-time purchase</p>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-secondary">Total</span>
                <span className="text-primary text-xl font-bold">${item.price}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
