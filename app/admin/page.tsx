'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface Analytics {
  totalUsers: number;
  totalVideos: number;
  totalOrders: number;
  totalRevenue: number;
  recentUsers: { id: string; display_name: string | null; username: string | null; created_at: string }[];
  recentVideos: { id: string; title: string; status: string; created_at: string }[];
}

export default function AdminDashboardPage() {
  const { profile } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (profile?.role !== 'admin') return;

    const fetchAnalytics = async () => {
      const [usersResult, videosResult, ordersResult, recentUsersResult, recentVideosResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('videos').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('amount', { count: 'exact' }),
        supabase.from('profiles').select('id, display_name, username, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('videos').select('id, title, status, created_at').order('created_at', { ascending: false }).limit(5),
      ]);

      const totalRevenue = (ordersResult.data as any[])?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;

      setAnalytics({
        totalUsers: usersResult.count || 0,
        totalVideos: videosResult.count || 0,
        totalOrders: ordersResult.count || 0,
        totalRevenue,
        recentUsers: (recentUsersResult.data as any[]) || [],
        recentVideos: (recentVideosResult.data as any[]) || [],
      });
      setLoading(false);
    };

    fetchAnalytics();
  }, [profile, supabase]);

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-screen-xl px-4 py-12">
          <div className="learning-card p-12 text-center">
            <p className="section-description mb-6 text-lg">You do not have access to this page.</p>
            <Link href="/" className="btn-primary px-6 py-3">Go Home</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-screen-xl px-4 py-12">
        <div className="mb-8">
          <h1 className="section-title text-3xl font-bold">Admin Dashboard</h1>
          <p className="section-description mt-1">Platform overview and management.</p>
        </div>

        {loading ? (
          <p className="section-description">Loading analytics...</p>
        ) : (
          <div className="grid gap-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="learning-card p-6">
                <div className="text-muted text-xs uppercase">Total Users</div>
                <div className="text-primary mt-2 text-3xl font-bold">{analytics?.totalUsers}</div>
              </div>
              <div className="learning-card p-6">
                <div className="text-muted text-xs uppercase">Total Videos</div>
                <div className="text-primary mt-2 text-3xl font-bold">{analytics?.totalVideos}</div>
              </div>
              <div className="learning-card p-6">
                <div className="text-muted text-xs uppercase">Total Orders</div>
                <div className="text-primary mt-2 text-3xl font-bold">{analytics?.totalOrders}</div>
              </div>
              <div className="learning-card p-6">
                <div className="text-muted text-xs uppercase">Total Revenue</div>
                <div className="text-primary mt-2 text-3xl font-bold">${analytics?.totalRevenue}</div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="learning-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="section-title text-lg font-bold">Recent Users</h3>
                  <Link href="/admin/users" className="text-sm text-blue-600 underline">View All</Link>
                </div>
                <div className="space-y-3">
                  {analytics?.recentUsers.length === 0 ? (
                    <p className="text-muted text-sm">No users yet.</p>
                  ) : (
                    analytics?.recentUsers.map((u) => (
                      <div key={u.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{u.display_name || u.username || 'Unnamed User'}</p>
                          <p className="text-muted text-xs">@{u.username || 'no-username'}</p>
                        </div>
                        <span className="text-muted text-xs">
                          {new Date(u.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="learning-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="section-title text-lg font-bold">Recent Videos</h3>
                  <Link href="/admin/videos" className="text-sm text-blue-600 underline">View All</Link>
                </div>
                <div className="space-y-3">
                  {analytics?.recentVideos.length === 0 ? (
                    <p className="text-muted text-sm">No videos yet.</p>
                  ) : (
                    analytics?.recentVideos.map((v) => (
                      <div key={v.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{v.title}</p>
                          <p className="text-muted text-xs capitalize">{v.status}</p>
                        </div>
                        <span className="text-muted text-xs">
                          {new Date(v.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
