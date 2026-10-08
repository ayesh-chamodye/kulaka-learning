'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

/**
 * Role selection page for first-time users.
 * Asks whether the user is a student, instructor, or admin.
 */
export default function RoleSelectionPage() {
  const { user, loading } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !user) return;

    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', user.id);

      if (error) {
        setError(error.message);
      } else {
        router.replace('/');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-screen-xl px-4 py-12">
          <p className="section-description">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-screen-xl px-4 py-16">
        <div className="mx-auto max-w-md">
          <div className="learning-card p-8">
            <div className="mb-8 text-center">
              <h1 className="section-title mb-2 text-2xl font-bold">Choose your role</h1>
              <p className="section-description text-sm">
                Are you signing up as a student, instructor, or admin?
              </p>
            </div>

            {error && (
              <div className="learning-alert learning-alert-danger mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-3">
                {[
                  { value: 'student', label: 'Student', desc: 'Browse and watch videos' },
                  { value: 'instructor', label: 'Instructor', desc: 'Upload and sell videos' },
                  { value: 'admin', label: 'Admin', desc: 'Manage categories and users' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition ${
                      role === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-slate-900">{option.label}</div>
                      <div className="text-sm text-slate-500">{option.desc}</div>
                    </div>
                    <input
                      type="radio"
                      name="role"
                      value={option.value}
                      checked={role === option.value}
                      onChange={(e) => setRole(e.target.value)}
                      className="h-4 w-4 text-blue-600"
                      required
                    />
                  </label>
                ))}
              </div>

              <button
                type="submit"
                disabled={!role || saving}
                className="btn-primary w-full px-6 py-3 text-base"
              >
                {saving ? 'Saving...' : 'Continue'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
