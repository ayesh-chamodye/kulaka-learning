import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Renders a video thumbnail. Shows the provided image when available,
 * otherwise falls back to a centered play icon placeholder.
 */
function VideoThumbnail({ thumbnailUrl }: { thumbnailUrl?: string | null }) {
  return (
    <div className="relative h-44 w-full overflow-hidden bg-slate-900">
      {thumbnailUrl ? (
        <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />
      ) : (
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
      )}
    </div>
  );
}

/**
 * Represents a video shown on the landing page.
 */
interface FeaturedVideo {
  id: string;
  title: string;
  duration: string;
  level: string;
  price: string;
  thumbnail_url: string | null;
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

  const { data: videos } = await supabase
    .from('videos')
    .select('id, title, duration, price, thumbnail_url, mux_playback_id, status, visibility')
    .eq('status', 'ready')
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
    .limit(6);

  const featuredVideos: FeaturedVideo[] = (videos || []).map((video) => ({
    id: video.id,
    title: video.title,
    duration: video.duration ? `${Math.floor(video.duration / 60)}h` : 'Video',
    level: 'Video',
    price: `$${video.price || 0}`,
    thumbnail_url: video.thumbnail_url || (video.mux_playback_id ? `https://image.mux.com/${video.mux_playback_id}/thumbnail.webp?time=0` : null),
  }));

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
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="border-t border-gray-100 bg-white py-24">
          <div className="mx-auto max-w-screen-xl px-4">
            <div className="mb-16 text-center">
              <h2 className="section-title mb-4 text-3xl font-bold md:text-4xl">How It Works</h2>
              <p className="section-description mx-auto max-w-2xl text-lg">
                Buy a video, checkout, and start watching in minutes.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { step: '1', title: 'Choose a Video', desc: 'Browse our catalog and pick the video you want to watch.' },
                { step: '2', title: 'Checkout Securely', desc: 'Add to cart and complete your purchase safely.' },
                { step: '3', title: 'Watch Instantly', desc: 'Stream your purchased video right away.' },
              ].map((step) => (
                <div key={step.step} className="learning-card p-8 text-center">
                  <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-2xl font-bold text-blue-600">
                    {step.step}
                  </div>
                  <h3 className="section-title mb-3 text-xl font-bold">{step.title}</h3>
                  <p className="section-description">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Courses */}
        <section id="courses" className="border-t border-gray-100 bg-slate-50 py-24">
          <div className="mx-auto max-w-screen-xl px-4">
            <div className="mb-16 text-center">
              <h2 className="section-title mb-4 text-3xl font-bold md:text-4xl">Featured Videos</h2>
              <p className="section-description mx-auto max-w-2xl text-lg">
                Explore our video catalog. Buy individual videos or complete courses.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredVideos.map((course) => (
                <div key={course.id} className="course-card">
                  <VideoThumbnail thumbnailUrl={course.thumbnail_url} />
                  <div className="p-6">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="learning-badge">{course.level}</span>
                      <span className="text-muted text-xs">{course.duration}</span>
                    </div>
                    <h3 className="course-card-title mb-2 text-lg">{course.title}</h3>
                    <p className="course-card-description mb-4 text-sm">
                      One-time purchase. Instant access.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-primary text-xl font-bold">{course.price}</span>
                      <a href={`/cart?video=${course.id}`} className="btn-primary px-4 py-2 text-sm">
                        Buy Now
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="border-t border-gray-100 bg-white py-24">
          <div className="mx-auto max-w-screen-xl px-4">
            <div className="mb-16 text-center">
              <h2 className="section-title mb-4 text-3xl font-bold md:text-4xl">Why Viewers Choose Us</h2>
              <p className="section-description mx-auto max-w-2xl text-lg">
                Simple pricing, instant access, and high-quality video content.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[
                { title: 'One-Time Purchase', desc: 'Buy individual videos or courses. No subscriptions required.' },
                { title: 'Instant Access', desc: 'Watch immediately after purchase. No waiting, no shipping.' },
                { title: 'High Quality', desc: 'Crystal-clear HD videos with professional production quality.' },
                { title: 'Lifetime Ownership', desc: 'Once purchased, your videos are yours to keep and rewatch.' },
              ].map((feature) => (
                <div key={feature.title} className="learning-card p-6 text-center">
                  <h3 className="section-title mb-2 text-lg font-bold">{feature.title}</h3>
                  <p className="section-description text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-gray-100 bg-slate-50 py-24">
          <div className="mx-auto max-w-screen-xl px-4">
            <div className="cta-section p-12 text-center text-white md:p-16">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to Start Watching?</h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-blue-100">
                Browse our video catalog and buy the content you want.
                Your next lesson is one click away.
              </p>
              <a href="#courses" className="cta-button">
                Browse Videos
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
}
