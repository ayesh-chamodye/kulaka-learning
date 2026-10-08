'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/**
 * OAuth callback page.
 * Completes the Google sign-in flow and redirects authenticated users to the home page.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (!profile?.role || profile.role === 'user') {
      router.replace('/role-selection');
    } else {
      router.replace('/');
    }
  }, [user, profile, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted">Completing sign in...</p>
    </div>
  );
}
