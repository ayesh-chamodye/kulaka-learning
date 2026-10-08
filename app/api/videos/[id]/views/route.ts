import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Increments the view count for a video using a safe DB helper.
 * Requires authentication and video visibility/read access.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { videoId } = await request.json();

    if (!videoId || typeof videoId !== 'string') {
      return NextResponse.json({ error: 'videoId is required' }, { status: 400 });
    }

    const { data, error } = await supabase.rpc('increment_video_views', {
      video_id: videoId,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
