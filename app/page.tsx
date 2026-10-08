import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Renders a placeholder video thumbnail with a centered play icon.
 * Used as a visual stand-in for videos that have not yet been fully prepared.
 */
function VideoThumbnail() {
  return (
    <div className="relative h-44 w-full overflow-hidden bg-slate-900">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg">
          <svg
            className="h-6 w-6 text-blue-600"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 5.14v14l11-7-11-7z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/**
 * Represents a featured video shown on the landing page.
 */
interface FeaturedVideo {
  id: string;
  title: string;
  duration: string;
  level: string;
  price: string;
}

/**
 * Landing page for the independent video learning platform.
 * Displays hero content, featured videos, how-it-works steps, and conversion sections.
 */
export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'instructor') {
      redirect('/seller');
    } else if (profile?.role === 'admin') {
      redirect('/seller');
    }
  }

  const featuredVideos: FeaturedVideo[] = [
    { id: 'web-dev', title: 'Web Development Bootcamp', duration: '24h', level: 'Beginner', price: '$49' },
    { id: 'data-science', title: 'Data Science Fundamentals', duration: '18h', level: 'Intermediate', price: '$59' },
    { id: 'ui-ux', title: 'UI/UX Design Mastery', duration: '15h', level: 'Beginner', price: '$39' },
    { id: 'mobile-app', title: 'Mobile App Development', duration: '28h', level: 'Intermediate', price: '$69' },
    { id: 'marketing', title: 'Digital Marketing Pro', duration: '16h', level: 'Beginner', price: '$44' },
    { id: 'cloud', title: 'Cloud Computing Essentials', duration: '20h', level: 'Advanced', price: '$79' },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="learning-hero pt-32 pb-20">
          <div className="mx-auto max-w-screen-xl px-4">
            <div className="mx-auto max-w-3xl text-center">
              <span className="learning-badge mb-6 inline-block">Video Learning</span>
              <h1 className="learning-hero-title mb-6 text-5xl font-bold md:text-6xl">
                Buy Individual Videos.{' '}
                <span className="learning-hero-highlight">Learn Instantly.</span>
              </h1>
              <p className="section-description mx-auto mb-10 max-w-2xl text-lg">
                Purchase single videos or full courses. Watch anytime, anywhere.
                No subscriptions, no commitments.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a href="#courses" className="btn-primary px-8 py-3 text-base">
                  Browse Videos
                </a>
                <a href="#how-it-works" className="btn-outline px-8 py-3 text-base">
                  How It Works
                </a>
              </div>
            </div>
}
