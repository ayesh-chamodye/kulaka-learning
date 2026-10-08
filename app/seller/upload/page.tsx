'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { uploadToMux } from '@/lib/mux';

export const dynamic = 'force-dynamic';

/**
 * Shape of a video category returned from the database.
 */
interface Category {
  id: string;
  name: string;
  slug: string;
}

/**
 * Upload page for creators.
 * Collects video metadata and file, uploads the file directly to Mux,
 * and creates a video record linked to the Mux asset.
 */
export default function UploadVideoPage() {
  const { user, loading } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [categoryId, setCategoryId] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [file, setFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      if (data) {
        setCategories(data);
      }
    };
    fetchCategories();
  }, [supabase]);

  /**
   * Handles file selection from the input.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
  };

  /**
   * Handles form submission for video upload.
   * 1. Creates video record in database
   * 2. Creates Mux direct upload session via API
   * 3. Uploads file directly to Mux
   * 4. Updates video record with Mux asset ID
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setProgress(null);

    if (!user) {
      setError('Please sign in to upload videos');
      return;
    }

    if (!file) {
      setError('Please select a video file to upload');
      return;
    }

    setUploading(true);
    try {
      const { data: video, error: videoError } = await supabase
        .from('videos')
        .insert({
          title,
          description,
          price: parseInt(price) || 0,
          category_id: categoryId || null,
          visibility,
          creator_id: user.id,
          status: 'processing',
        })
        .select()
        .single();

      if (videoError || !video) {
        setError(videoError?.message || 'Failed to create video record');
        return;
      }

      setProgress('Creating Mux upload session...');
      const muxResponse = await fetch('/api/mux/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: video.id }),
      });

      if (!muxResponse.ok) {
        const errorData = await muxResponse.json();
        throw new Error(errorData.error || 'Failed to create Mux upload session');
      }

      const muxData = await muxResponse.json();
      const uploadUrl = muxData.uploadUrl;

      if (!uploadUrl) {
        throw new Error('Failed to get Mux upload URL');
      }

      setProgress('Uploading video to Mux...');
      await uploadToMux(uploadUrl, file);

      setProgress('Finalizing...');
      const assetId = muxData.assetId;

      const { error: updateError } = await supabase
        .from('videos')
        .update({
          mux_asset_id: assetId,
          status: 'processing',
        })
        .eq('id', video.id);

      if (updateError) {
        throw updateError;
      }

      setSuccess('Video uploaded successfully! It will be processed shortly.');
      setTitle('');
      setDescription('');
      setPrice('0');
      setCategoryId('');
      setVisibility('public');
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-screen-xl px-4 py-12">
          <p className="section-description">Loading...</p>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-screen-xl px-4 py-12">
          <div className="learning-card p-12 text-center">
            <p className="section-description mb-6 text-lg">Please sign in to upload videos.</p>
            <Link href="/login" className="btn-primary px-6 py-3">Sign In</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-screen-xl px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <h1 className="section-title mb-8 text-3xl font-bold">Upload Video</h1>

          {error && (
            <div className="learning-alert learning-alert-danger mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="learning-alert learning-alert-success mb-6">
              {success}
            </div>
          )}

          {progress && !success && (
            <div className="learning-alert learning-alert-info mb-6">
              {progress}
            </div>
          )}

          <form onSubmit={handleSubmit} className="learning-card p-8 space-y-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="learning-input"
                placeholder="Video title"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="learning-input"
                placeholder="Describe your video"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Price (USD)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  className="learning-input"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="learning-input"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Video File</label>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                required
                className="learning-input"
              />
              <p className="mt-1 text-xs text-slate-500">
                Supported formats: MP4, MOV, AVI. File will be uploaded directly to Mux.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Visibility</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="learning-input"
              >
                <option value="public">Public</option>
                <option value="unlisted">Unlisted</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div className="learning-alert learning-alert-info">
              Video files are stored and streamed through Mux. After submission, your video will be processed and ready for viewing shortly.
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="btn-primary w-full px-6 py-3 text-base"
            >
              {uploading ? 'Uploading...' : 'Upload Video'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
