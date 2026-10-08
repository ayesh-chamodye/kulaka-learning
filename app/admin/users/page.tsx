'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface User {
  id: string;
  display_name: string | null;
  username: string | null;
  role: string;
  created_at: string;
  avatar_url: string | null;
}

export default function AdminUsersPage() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (profile?.role !== 'admin') return;

    const fetchUsers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setUsers(data as User[]);
      }
      setLoading(false);
    };

    fetchUsers();
  }, [profile, supabase]);

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-screen-xl px-4 py-12">
          <div className="learning-card p-12 text-center">
            <p className="section-description mb-6 text-lg">You do not have access to this page.</p>
            <Link href="/" className="btn-primary px-6 py-3">Go Home</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-screen-xl px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="section-title text-3xl font-bold">Users</h1>
            <p className="section-description mt-1">Manage students, instructors, and admins.</p>
          </div>
          <Link href="/admin" className="btn-outline px-4 py-2 text-sm">Back to Dashboard</Link>
        </div>

        {loading ? (
          <p className="section-description">Loading...</p>
        ) : users.length === 0 ? (
          <div className="learning-card p-12 text-center">
            <p className="section-description">No users found.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {users.map((user) => (
              <div key={user.id} className="learning-card p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.display_name || 'User'} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                        {(user.display_name?.[0] || user.username?.[0] || 'U').toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="course-card-title text-base">{user.display_name || user.username || 'Unnamed User'}</h3>
                      <p className="text-muted text-xs">@{user.username || 'no-username'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`learning-badge ${user.role === 'admin' ? 'bg-red-50 text-red-700' : user.role === 'instructor' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'}`}>
                      {user.role}
                    </span>
                    <span className="text-muted text-xs">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
