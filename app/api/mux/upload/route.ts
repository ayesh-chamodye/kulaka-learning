import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createMuxUpload } from '@/lib/mux';

/**
 * API route to create a Mux direct upload session.
 * Returns the upload URL and upload ID for client-side file upload.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

    if (!profile || profile.role !== 'creator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const muxUpload = await createMuxUpload();

    return NextResponse.json({
      uploadId: muxUpload.data?.id,
      uploadUrl: muxUpload.data?.upload_url,
      assetId: muxUpload.data?.new_asset_settings?.asset_id || null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
