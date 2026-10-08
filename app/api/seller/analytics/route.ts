import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface VideoAnalyticsRow {
  id: string;
  title: string;
  status: string;
  visibility: string;
  views: number;
  price: number;
  created_at: string;
  buyers: number;
  revenue: number;
}

interface SellerAnalyticsResponse {
  videos: VideoAnalyticsRow[];
  totals: {
    views: number;
    buyers: number;
    revenue: number;
  };
}

/**
 * Returns analytics for the current creator: per-video views, buyers, revenue,
 * plus aggregate totals.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'creator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select('id, title, status, visibility, views, price, created_at')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false });

    if (videosError) {
      return NextResponse.json({ error: videosError.message }, { status: 500 });
    }

    const videoIds = (videos || []).map((v) => v.id);

    let ordersMap = new Map<string, { buyers: number; revenue: number }>();

    if (videoIds.length > 0) {
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('video_id, amount, status')
        .in('video_id', videoIds)
        .eq('status', 'completed');

      if (!ordersError && orders) {
        for (const order of orders) {
          const current = ordersMap.get(order.video_id) || { buyers: 0, revenue: 0 };
          current.buyers += 1;
          current.revenue += order.amount || 0;
          ordersMap.set(order.video_id, current);
        }
      }
    }

    const videosAnalytics: VideoAnalyticsRow[] = (videos || []).map((video) => {
      const stats = ordersMap.get(video.id) || { buyers: 0, revenue: 0 };
      return {
        id: video.id,
        title: video.title,
        status: video.status,
        visibility: video.visibility,
        views: video.views || 0,
        price: video.price || 0,
        created_at: video.created_at,
        buyers: stats.buyers,
        revenue: stats.revenue,
      };
    });

    const totals = videosAnalytics.reduce(
      (acc, video) => ({
        views: acc.views + video.views,
        buyers: acc.buyers + video.buyers,
        revenue: acc.revenue + video.revenue,
      }),
      { views: 0, buyers: 0, revenue: 0 }
    );

    const response: SellerAnalyticsResponse = {
      videos: videosAnalytics,
      totals,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
