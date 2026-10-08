'use client';

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

/**
 * Shopping cart page.
 * Reads the selected video from query parameters and shows a summary with checkout link.
 */
export default function Cart() {
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const videoParam = params.get('video');
  const course = videoParam && videoParam in COURSES ? COURSES[videoParam as keyof typeof COURSES] : null;
  const cartItems = course ? [course] : [];

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-screen-xl px-4 py-12">
        <h1 className="section-title mb-8 text-3xl font-bold md:text-4xl">Your Cart</h1>

        {cartItems.length === 0 ? (
          <div className="learning-card p-12 text-center">
            <p className="section-description mb-6 text-lg">Your cart is empty.</p>
            <a href="/#courses" className="btn-primary px-6 py-3">
              Browse Videos
            </a>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, index) => (
                <div key={index} className="learning-card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="course-card-title text-lg">{item.title}</h3>
                      <p className="text-muted mt-1 text-sm">One-time purchase</p>
                    </div>
                    <span className="text-primary text-xl font-bold">${item.price}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="learning-card p-6">
                <h3 className="section-title mb-4 text-lg font-bold">Order Summary</h3>
                <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
                  <span className="text-secondary">Total</span>
                  <span className="text-primary text-xl font-bold">${total}</span>
                </div>
                <a href="/checkout" className="btn-primary w-full px-6 py-3 text-base">
                  Proceed to Checkout
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
