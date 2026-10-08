'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface PurchasedVideo {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  mux_playback_id: string | null;
  created_at: string;
}

/**
 * Library page showing all purchased videos for the authenticated user.
 */
export default function LibraryPage() {
  const { user, loading } = useAuth();
  const [videos, setVideos] = useState<PurchasedVideo[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchLibrary = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('orders')
        .select(
          `
          video_id,
          videos (
            id,
            title,
            description,
            thumbnail_url,
            mux_playback_id,
            status,
            created_at
          )
        `
        )
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (data) {
        const purchased = data
          .filter((order: any) => order.videos && order.videos.status === 'ready')
          .map((order: any) => order.videos);
        setVideos(purchased);
      }
      setPageLoading(false);
    };

    fetchLibrary();
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
            <p className="section-description mb-6 text-lg">Please sign in to view your library.</p>
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
        <h1 className="section-title mb-8 text-3xl font-bold md:text-4xl">My Library</h1>

        {videos.length === 0 ? (
          <div className="learning-card p-12 text-center">
            <p className="section-description mb-6 text-lg">You haven&apos;t purchased any videos yet.</p>
            <Link href="/#courses" className="btn-primary px-6 py-3">Browse Videos</Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <Link key={video.id} href={`/watch/${video.id}`} className="course-card">
                <div className="course-card-image h-44 w-full bg-slate-900" style={{
                  backgroundImage: video.thumbnail_url ? `url(${video.thumbnail_url})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}>
                  {!video.thumbnail_url && (
                    <div className="flex h-full items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90">
                        <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5.14v14l11-7-11-7z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="course-card-title mb-1">{video.title}</h3>
                  <p className="course-card-description line-clamp-2">{video.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
