'use client'

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Settings, ArrowLeft } from 'lucide-react';

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


      </main>
    </div>
  );
}
