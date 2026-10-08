'use client';

import { useAuth } from '@/contexts/AuthContext';

export function useRequireAuth() {
  const { user, loading } = useAuth();

  if (loading) {
    return { authorized: false, loading: true };
  }

  if (!user) {
    return { authorized: false, loading: false };
  }

  return { authorized: true, loading: false };
}
