'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface Video {
  id: string;
  title: string;
  description: string;
  status: string;
  visibility: string;
  views: number;
  price: number;
  created_at: string;
  thumbnail_url: string | null;
}

export default function SellerDashboardPage() {
  const { user, loading } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;

    const fetchVideos = async () => {
      const { data } = await supabase
        .from('videos')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setVideos(data);
      }
      setPageLoading(false);
    };

    fetchVideos();
  }, [user, supabase]);

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
            <p className="section-description mb-6 text-lg">Please sign in to access the seller dashboard.</p>
            <Link href="/login" className="btn-primary px-6 py-3">Sign In</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-screen-xl px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="section-title text-3xl font-bold">Seller Dashboard</h1>
            <p className="section-description mt-1">Manage your videos and track performance.</p>
          </div>
          <Link href="/seller/upload" className="btn-primary px-6 py-3">Upload New Video</Link>
        </div>

        <div className="grid gap-6">
          {videos.length === 0 ? (
            <div className="learning-card p-12 text-center">
              <p className="section-description mb-6 text-lg">You haven&apos;t uploaded any videos yet.</p>
              <Link href="/seller/upload" className="btn-primary px-6 py-3">Upload Your First Video</Link>
            </div>
          ) : (
            videos.map((video) => (
              <div key={video.id} className="learning-card p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className={`learning-badge ${video.status === 'ready' ? 'bg-green-50 text-green-700' : video.status === 'processing' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                        {video.status}
                      </span>
                      <span className="text-muted text-xs">{video.visibility}</span>
                    </div>
                    <h3 className="course-card-title text-lg">{video.title}</h3>
                    <p className="text-muted mt-1 text-sm line-clamp-1">{video.description}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-primary text-xl font-bold">{video.views}</div>
                      <div className="text-muted text-xs">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="text-primary text-xl font-bold">${video.price}</div>
                      <div className="text-muted text-xs">Price</div>
                    </div>
                    <div className="text-muted text-xs">
                      {new Date(video.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
