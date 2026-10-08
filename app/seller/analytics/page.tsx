'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface VideoAnalytics {
  id: string;
  title: string;
  status: string;
  visibility: string;
  views: number;
  price: number;
  created_at: string;
  buyers: number;
  revenue: number;
}

interface AnalyticsResponse {
  videos: VideoAnalytics[];
  totals: {
    views: number;
    buyers: number;
    revenue: number;
  };
}

/**
 * Seller analytics page showing aggregate totals and best-performing videos.
 */
export default function SellerAnalyticsPage() {
  const { user, loading } = useAuth();
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchAnalytics = async () => {
      const response = await fetch('/api/seller/analytics');
      if (response.ok) {
        const json = await response.json();
        setData(json);
      }
      setPageLoading(false);
    };

    fetchAnalytics();
  }, [user]);

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-screen-xl px-4 py-12">
          <p className="section-description">Loading...</p>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-screen-xl px-4 py-12">
          <div className="learning-card p-12 text-center">
            <p className="section-description mb-6 text-lg">Please sign in to view analytics.</p>
            <Link href="/login" className="btn-primary px-6 py-3">Sign In</Link>
          </div>
        </main>
      </div>
    );
  }

  const totals = data?.totals || { views: 0, buyers: 0, revenue: 0 };
  const videos = data?.videos || [];
  const topVideos = [...videos].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const mostViewed = [...videos].sort((a, b) => b.views - a.views).slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-screen-xl px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="section-title text-3xl font-bold">Analytics</h1>
            <p className="section-description mt-1">Track performance across all your videos.</p>
          </div>
          <Link href="/seller" className="btn-secondary px-6 py-3">Dashboard</Link>
        </div>

        <div className="mb-10 grid gap-6 md:grid-cols-3">
          <div className="learning-card p-6 text-center">
            <div className="text-primary text-4xl font-bold">{totals.views}</div>
            <div className="text-muted mt-1 text-sm">Total Views</div>
          </div>
          <div className="learning-card p-6 text-center">
            <div className="text-primary text-4xl font-bold">{totals.buyers}</div>
            <div className="text-muted mt-1 text-sm">Total Buyers</div>
          </div>
          <div className="learning-card p-6 text-center">
            <div className="text-primary text-4xl font-bold">${totals.revenue}</div>
            <div className="text-muted mt-1 text-sm">Total Revenue</div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="learning-card p-6">
            <h2 className="section-title mb-4 text-lg font-bold">Top Revenue</h2>
            {topVideos.length === 0 ? (
              <p className="text-muted text-sm">No sales yet.</p>
            ) : (
              <div className="space-y-4">
                {topVideos.map((video) => (
                  <div key={video.id} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{video.title}</div>
                      <div className="text-xs text-muted">{video.buyers} buyer{video.buyers === 1 ? '' : 's'}</div>
                    </div>
                    <div className="text-sm font-semibold text-primary">${video.revenue}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="learning-card p-6">
            <h2 className="section-title mb-4 text-lg font-bold">Most Viewed</h2>
            {mostViewed.length === 0 ? (
              <p className="text-muted text-sm">No views yet.</p>
            ) : (
              <div className="space-y-4">
                {mostViewed.map((video) => (
                  <div key={video.id} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{video.title}</div>
                      <div className="text-xs text-muted">${video.price} &middot; {video.status}</div>
                    </div>
                    <div className="text-sm font-semibold text-primary">{video.views} views</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
