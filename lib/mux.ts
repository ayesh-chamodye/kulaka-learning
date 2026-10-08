const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID;
const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET;

export async function getMuxToken() {
  if (!MUX_TOKEN_ID || !MUX_TOKEN_SECRET) {
    throw new Error('Mux credentials are not configured');
  }

  const response = await fetch('https://api.mux.com/video/v1/uploads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`,
    },
    body: JSON.stringify({
      new_asset_settings: {
        playback_policy: ['public'],
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create Mux upload');
  }

  return response.json();
}

export async function getMuxPlaybackUrl(playbackId: string) {
  if (!playbackId) return null;
  return `https://stream.mux.com/${playbackId}.m3u8`;
}
