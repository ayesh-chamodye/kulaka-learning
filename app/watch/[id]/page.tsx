import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

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
    .select('id, title, mux_playback_id, status, visibility')
    .eq('id', id)
    .single();

  const isMock = !video && !!mockVideo;
  const resolvedTitle = video?.title || mockVideo?.title || 'Video';
  const playbackId = video?.mux_playback_id || 'l027zFJyVafpR8u02q6Rl02lRz6xiXZ6HTUNyk8X016QXGw';

  if (video && video.status !== 'ready') {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-screen-xl px-4 py-12">
          <div className="learning-card p-12 text-center">
            <p className="section-description mb-6 text-lg">Video not found or not ready.</p>
            <a href="/#courses" className="btn-primary px-6 py-3">
              Browse Videos
            </a>
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
            <a href="/#courses" className="btn-primary px-6 py-3">
              Browse Videos
            </a>
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
              <a href={`/cart?video=${id}`} className="btn-primary px-6 py-3">
                Purchase Video
              </a>
            </div>
          </main>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="mx-auto max-w-screen-xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white md:text-3xl">{resolvedTitle}</h1>
        </div>
        <div className="learning-card overflow-hidden p-0">
          <iframe
            src={`https://player.mux.com/${playbackId}?metadata-video-title=${encodeURIComponent(resolvedTitle)}&video-title=${encodeURIComponent(resolvedTitle)}`}
            style={{ width: '100%', border: 'none', aspectRatio: '16/9' }}
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
            allowFullScreen
          />
        </div>
      </main>
    </div>
  );
}