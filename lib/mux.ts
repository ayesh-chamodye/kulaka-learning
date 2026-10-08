const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID;
const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET;

/**
 * Creates a new Mux upload session with default public playback policy.
 * Used by the seller upload flow to obtain an upload URL and asset configuration.
 */
export async function createMuxUpload() {
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
      cors_origin: '*',
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to create Mux upload: ${response.status} ${text}`);
  }

  return response.json();
}

/**
 * Uploads a file directly to Mux using a presigned upload URL.
 * @param uploadUrl - The presigned URL returned by Mux
 * @param file - The file to upload
 */
export async function uploadToMux(uploadUrl: string, file: File) {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type || 'video/mp4',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to upload file to Mux: ${response.status}`);
  }

  return response;
}

/**
 * Builds the direct stream URL for a given Mux playback ID.
 */
export function getMuxPlaybackUrl(playbackId: string) {
  if (!playbackId) return null;
  return `https://stream.mux.com/${playbackId}.m3u8`;
}
