'use client'

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Settings, Database, Users, Tag, Film, ArrowLeft, FileText } from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();

  // Simple admin check (you can make this more sophisticated)
  const isAdmin = user?.email?.includes('admin') || user?.email === 'testuser02@email.com';

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Access Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to access admin tools.</p>
          <Link href="/login" className="text-yellow-600 hover:text-yellow-700 font-medium">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don&apos have admin privileges.</p>
          <Link href="/" className="text-yellow-600 hover:text-yellow-700 font-medium">
            Back to Home
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
            <Link href="/" className="flex items-center gap-2 text-yellow-500 hover:text-yellow-400">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to App</span>
            </Link>
            <div className="flex items-center gap-2">
              <Settings className="w-6 h-6 text-yellow-500" />
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Tools</h2>
          <p className="text-gray-600">Manage and test your movie application.</p>
        </div>

        {/* Admin Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Database Testing */}
          <Link href="/admin/testdatabase" className="group">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-8 h-8 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900">Test Database</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Test database connections, run queries, and check data integrity.
              </p>
              <div className="mt-4 text-blue-600 text-sm font-medium group-hover:text-blue-700">
                Open Tool →
              </div>
            </div>
          </Link>

          {/* User Management */}
          <Link href="/admin/users" className="group">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-8 h-8 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
              </div>
              <p className="text-gray-600 text-sm">
                View users, manage profiles, and check user activity.
              </p>
              <div className="mt-4 text-green-600 text-sm font-medium group-hover:text-green-700">
                Open Tool →
              </div>
            </div>
          </Link>

          {/* Tags Management */}
          <Link href="/admin/tags" className="group">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <Tag className="w-8 h-8 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900">Tags Management</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Create, edit, and manage movie tags with usage statistics.
              </p>
              <div className="mt-4 text-blue-600 text-sm font-medium group-hover:text-blue-700">
                Open Tool →
              </div>
            </div>
          </Link>

          {/* Categories Management */}
          <Link href="/admin/categories" className="group">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <Tag className="w-8 h-8 text-purple-500" />
                <h3 className="text-lg font-semibold text-gray-900">Categories Management</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Create, edit, and manage movie categories with usage statistics.
              </p>
              <div className="mt-4 text-purple-600 text-sm font-medium group-hover:text-purple-700">
                Open Tool →
              </div>
            </div>
          </Link>

          {/* Movies Management */}
          <Link href="/admin/movies" className="group">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <Film className="w-8 h-8 text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-900">Movies</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Add, edit, and manage movie data.
              </p>
              <div className="mt-4 text-yellow-600 text-sm font-medium group-hover:text-yellow-700">
                Open Tool →
              </div>
            </div>
          </Link>

          {/* Blog Posts Management */}
          <Link href="/admin/blog-posts" className="group">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-8 h-8 text-indigo-500" />
                <h3 className="text-lg font-semibold text-gray-900">Blog Posts</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Manage SEO blog posts, approve/hide content, and view statistics.
              </p>
              <div className="mt-4 text-indigo-600 text-sm font-medium group-hover:text-indigo-700">
                Open Tool →
              </div>
            </div>
          </Link>

        </div>

        {/* Current User Info */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Session</h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Email:</span> {user.email}</p>
            <p><span className="font-medium">User ID:</span> {user.id}</p>
            <p><span className="font-medium">Admin Status:</span> <span className="text-green-600">✓ Authorized</span></p>
          </div>
        </div>
      </main>
    </div>
  );
}
