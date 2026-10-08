import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Mock checkout API route.
 * Validates the requested video, ensures the user has not already purchased it,
 * then creates or updates a completed order record.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { videoId } = body;

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('id, title, price, status, visibility')
      .eq('id', videoId)
      .single();

    if (videoError || !video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    if (video.status !== 'ready') {
      return NextResponse.json({ error: 'Video is not available for purchase' }, { status: 400 });
    }

    if (video.visibility !== 'public') {
      return NextResponse.json({ error: 'Video is not publicly available' }, { status: 403 });
    }

    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('video_id', videoId)
      .single();

    if (existingOrder && existingOrder.status === 'completed') {
      return NextResponse.json({ error: 'You already own this video' }, { status: 400 });
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .upsert({
        user_id: user.id,
        video_id: videoId,
        amount: video.price || 0,
        status: 'completed',
        provider: 'mock',
        payment_id: `mock_${Date.now()}`,
      })
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
