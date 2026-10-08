'use client';

import { useEffect } from 'react';

interface TrackedPlayerProps {
  videoId: string;
  playbackId: string;
  title: string;
}

/**
 * Client wrapper around the Mux player that records a view once
 * when playback begins, using a best-effort API call.
 */
export default function TrackedPlayer({ videoId, playbackId, title }: TrackedPlayerProps) {
  useEffect(() => {
    let fired = false;

    const handleMessage = (event: MessageEvent) => {
      if (fired) return;
      const data = typeof event.data === 'string' ? null : event.data;
      if (!data || typeof data !== 'object') return;

      const anyData = data as any;
      if (anyData.event === 'play' || anyData.type === 'play') {
        fired = true;
        fetch('/api/videos/' + videoId + '/views', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId }),
        }).catch(() => {
          // best-effort view tracking
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [videoId]);

  return (
    <iframe
      src={`https://player.mux.com/${playbackId}?metadata-video-title=${encodeURIComponent(title)}&video-title=${encodeURIComponent(title)}`}
      style={{ width: '100%', border: 'none', aspectRatio: '16/9' }}
      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
      allowFullScreen
    />
  );
}
