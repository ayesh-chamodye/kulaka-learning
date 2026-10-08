import Navbar from '@/components/Navbar';

const COURSES = {
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
  const course = COURSES[id as keyof typeof COURSES];

  if (!course) {
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

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="mx-auto max-w-screen-xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white md:text-3xl">{course.title}</h1>
        </div>
        <div className="learning-card overflow-hidden p-0">
          <iframe
            src="https://player.mux.com/l027zFJyVafpR8u02q6Rl02lRz6xiXZ6HTUNyk8X016QXGw?metadata-video-title=Movie&video-title=Movie"
            style={{ width: '100%', border: 'none', aspectRatio: '16/9' }}
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
            allowFullScreen
          />
        </div>
      </main>
    </div>
  );
}
