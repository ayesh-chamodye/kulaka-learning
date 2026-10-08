'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface Video {
  id: string;
  title: string;
  status: string;
  visibility: string;
  price: number;
  views: number;
  created_at: string;
  profiles: { display_name: string | null; username: string | null };
}

interface User {
  id: string;
  display_name: string | null;
  username: string | null;
  role: string;
  created_at: string;
}

export default function AdminVideosPage() {
  const { user, profile } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (profile?.role !== 'admin') return;

    const fetchVideos = async () => {
      const { data } = await supabase
        .from('videos')
        .select('id, title, status, visibility, price, views, created_at, profiles (display_name, username)')
        .order('created_at', { ascending: false });

      if (data) {
        setVideos(data as unknown as Video[]);
      }
      setLoading(false);
    };

    fetchVideos();
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="section-title text-3xl font-bold">All Videos</h1>
            <p className="section-description mt-1">Manage videos uploaded by instructors.</p>
          </div>
          <Link href="/admin" className="btn-outline px-4 py-2 text-sm">Back to Dashboard</Link>
        </div>

        {loading ? (
          <p className="section-description">Loading...</p>
        ) : videos.length === 0 ? (
          <div className="learning-card p-12 text-center">
            <p className="section-description">No videos found.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {videos.map((video) => (
              <div key={video.id} className="learning-card p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <h3 className="course-card-title text-lg">{video.title}</h3>
                    <p className="text-muted mt-1 text-sm">
                      Instructor: {video.profiles?.display_name || video.profiles?.username || 'Unknown'}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`learning-badge ${video.status === 'ready' ? 'bg-green-50 text-green-700' : video.status === 'processing' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                        {video.status}
                      </span>
                      <span className="text-muted text-xs">{video.visibility}</span>
                      <span className="text-muted text-xs">${video.price}</span>
                      <span className="text-muted text-xs">{video.views} views</span>
                    </div>
                  </div>
                  <div className="text-muted text-xs">
                    {new Date(video.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
