import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import TrackedPlayer from './TrackedPlayer';

/**
 * Fallback metadata for videos that are not yet persisted in the database.
 * Used during early development and testing.
 */
const MOCK_VIDEOS: Record<string, { title: string }> = {
  'web-dev': { title: 'Web Development Bootcamp' },
  'data-science': { title: 'Data Science Fundamentals' },
  'ui-ux': { title: 'UI/UX Design Mastery' },
  'mobile-app': { title: 'Mobile App Development' },
  'marketing': { title: 'Digital Marketing Pro' },
  'cloud': { title: 'Cloud Computing Essentials' },
};

interface WatchPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface VideoCard {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  mux_playback_id: string | null;
}

/**
 * Video watch page with YouTube-like layout.
 * Enforces authentication, verifies video readiness and purchase status,
 * then renders the Mux player with a sidebar of other purchased videos.
 */
export default async function WatchPage({ params }: WatchPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const mockVideo = MOCK_VIDEOS[id];

  const { data: video } = await supabase
    .from('videos')
    .select('id, title, mux_playback_id, status, visibility, description, thumbnail_url')
    .eq('id', id)
    .single();

  const isMock = !video && !!mockVideo;
  const resolvedTitle = video?.title || mockVideo?.title || 'Video';
  const resolvedDescription = video?.description || '';
  const thumbnailUrl = video?.thumbnail_url || null;
  const playbackId = video?.mux_playback_id || 'l027zFJyVafpR8u02q6Rl02lRz6xiXZ6HTUNyk8X016QXGw';

  if (video && video.status !== 'ready') {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-screen-xl px-4 py-12">
          <div className="learning-card p-12 text-center">
            <p className="section-description mb-6 text-lg">Video not found or not ready.</p>
            <Link href="/#courses" className="btn-primary px-6 py-3">Browse Videos</Link>
          </div>
        </main>
      </div>
    );
  }

  if (!isMock && !video) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-screen-xl px-4 py-12">
          <div className="learning-card p-12 text-center">
            <p className="section-description mb-6 text-lg">Video not found.</p>
            <Link href="/#courses" className="btn-primary px-6 py-3">Browse Videos</Link>
          </div>
        </main>
      </div>
    );
  }

  if (!isMock) {
    const { data: order } = await supabase
      .from('orders')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('video_id', id)
      .eq('status', 'completed')
      .single();

    if (!order) {
      return (
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <main className="mx-auto max-w-screen-xl px-4 py-12">
            <div className="learning-card p-12 text-center">
              <p className="section-description mb-6 text-lg">You need to purchase this video to watch it.</p>
              <Link href={`/cart?video=${id}`} className="btn-primary px-6 py-3">Purchase Video</Link>
            </div>
          </main>
        </div>
      );
    }
  }

  const { data: libraryVideos } = await supabase
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
        status
      )
    `
    )
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false });

  const purchasedVideos: VideoCard[] = (libraryVideos || [])
    .filter((order: any) => order.videos && order.videos.id !== id && order.videos.status === 'ready')
    .map((order: any) => order.videos);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-screen-xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-lg bg-black">
              <TrackedPlayer videoId={id} playbackId={playbackId} title={resolvedTitle} />
            </div>
            <div className="mt-4">
              <h1 className="text-xl font-bold text-gray-900 md:text-2xl">{resolvedTitle}</h1>
              <p className="mt-2 text-sm text-gray-600">{resolvedDescription}</p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Up Next</h2>
            <div className="space-y-4">
              {purchasedVideos.length === 0 ? (
                <p className="text-sm text-gray-500">No other purchased videos yet.</p>
              ) : (
                purchasedVideos.map((video) => (
                  <Link key={video.id} href={`/watch/${video.id}`} className="flex gap-3 group">
                    <div className="relative h-24 w-40 flex-shrink-0 overflow-hidden rounded-lg bg-slate-900">
                      {video.thumbnail_url ? (
                        <img src={video.thumbnail_url} alt={video.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <svg className="h-8 w-8 text-white/80" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5.14v14l11-7-11-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-blue-600">{video.title}</h3>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}