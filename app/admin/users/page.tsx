'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Search, Calendar, Tag, Film } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase-client';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

type ProfileSummary = Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'user_name' | 'full_name' | 'created_at'>;

interface UserProfile extends ProfileSummary {
  email?: string;
  last_sign_in_at?: string;
  tag_count?: number;
  category_count?: number;
  note_count?: number;
}

export default function UsersManagementPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Simple admin check
  const isAdmin = user?.email?.includes('admin') || user?.email === 'testuser02@email.com';

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const supabase: SupabaseClient<Database> = createClient();
      
      // Get profiles with user activity counts
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_name,
          full_name,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const profileList = (profiles ?? []) as ProfileSummary[];

      // Get user activity counts
      const usersWithActivity = await Promise.all(
        profileList.map(async (profile) => {
          const fetchCount = async (
            table: 'user_movie_tags' | 'user_movie_categories' | 'user_notes'
          ) => {
            const { count, error } = await supabase
              .from(table)
              .select('*', { count: 'exact', head: true })
              .eq('user_id', profile.id);

            if (error) {
              console.error(`Error fetching ${table} count for user ${profile.id}:`, error);
              return 0;
            }

            return count ?? 0;
          };

          const [tagCount, categoryCount, noteCount] = await Promise.all([
            fetchCount('user_movie_tags'),
            fetchCount('user_movie_categories'),
            fetchCount('user_notes'),
          ]);

          return {
            ...profile,
            tag_count: tagCount,
            category_count: categoryCount,
            note_count: noteCount,
          };
        })
      );

      setUsers(usersWithActivity);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Access control check
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <Link href="/admin" className="text-yellow-600 hover:text-yellow-700 font-medium">
            Back to Admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/admin" className="flex items-center gap-2 text-yellow-500 hover:text-yellow-400">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Admin</span>
            </Link>
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-yellow-500" />
              <h1 className="text-xl font-semibold">User Management</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">User Management</h2>
          <p className="text-gray-600">View and manage user accounts and activity.</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Search Users
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username or full name..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Users ({filteredUsers.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No users found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredUsers.map((userProfile) => (
                <div key={userProfile.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {userProfile.full_name}
                        </h4>
                        <span className="text-sm text-gray-500">
                          @{userProfile.user_name}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Joined {new Date(userProfile.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-1 text-blue-600">
                          <Tag className="w-4 h-4" />
                          <span>{userProfile.tag_count} tags</span>
                        </div>
                        <div className="flex items-center gap-1 text-purple-600">
                          <Tag className="w-4 h-4" />
                          <span>{userProfile.category_count} categories</span>
                        </div>
                        <div className="flex items-center gap-1 text-green-600">
                          <Film className="w-4 h-4" />
                          <span>{userProfile.note_count} notes</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-gray-500 font-mono">
                        ID: {userProfile.id.substring(0, 8)}...
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                <p className="text-sm text-gray-600">Total Users</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <Tag className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {users.reduce((sum, user) => sum + (user.tag_count || 0), 0)}
                </p>
                <p className="text-sm text-gray-600">Total Tags</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <Tag className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {users.reduce((sum, user) => sum + (user.category_count || 0), 0)}
                </p>
                <p className="text-sm text-gray-600">Total Categories</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <Film className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {users.reduce((sum, user) => sum + (user.note_count || 0), 0)}
                </p>
                <p className="text-sm text-gray-600">Total Notes</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
