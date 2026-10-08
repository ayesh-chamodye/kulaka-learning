'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { put } from '@vercel/blob';

/**
 * Profile page for authenticated users.
 * Allows viewing and updating profile details including avatar upload via Vercel Blob.
 */
export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setDisplayName(data.display_name || '');
        setUsername(data.username || '');
        setBio(data.bio || '');
        setAvatarUrl(data.avatar_url);
      }
    };

    fetchProfile();
  }, [user, supabase]);

  /**
   * Handles avatar file selection and uploads it to Vercel Blob.
   */
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const blob = await put(file.name, file, { access: 'public' });
      setAvatarUrl(blob.url);
      setAvatarFile(file);
    } catch (err) {
      setMessage('Failed to upload avatar');
    }
  };

  /**
   * Submits profile updates to Supabase.
   * Only allows the authenticated user to update their own profile fields.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      const updates: any = {
        display_name: displayName,
        username,
        bio,
      };

      if (avatarUrl) {
        updates.avatar_url = avatarUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        setMessage(error.message);
      } else {
        setMessage('Profile updated successfully');
      }
    } catch {
      setMessage('An unexpected error occurred');
    } finally {
      setSaving(false);
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
            <p className="section-description mb-6 text-lg">Please sign in to view your profile.</p>
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
          <h1 className="section-title mb-8 text-3xl font-bold">Your Profile</h1>

          {message && (
            <div className={`learning-alert mb-6 ${message.includes('success') || message.includes('updated') ? 'learning-alert-success' : 'learning-alert-danger'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="learning-card p-8 space-y-6">
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-2xl font-bold text-blue-600">
                  {displayName?.[0] || user.email?.[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <label className="btn-outline cursor-pointer px-4 py-2 text-sm">
                  Change Avatar
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="learning-input"
                placeholder="Your display name"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="learning-input"
                placeholder="username"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="learning-input"
                placeholder="Tell us about yourself"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-6 py-3 text-base"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
