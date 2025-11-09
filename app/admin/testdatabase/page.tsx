'use client'

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Database, Play, CheckCircle, XCircle, Loader } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase-client';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  duration?: number;
}

export default function TestDatabasePage() {
  const { user } = useAuth();
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Simple admin check
  const isAdmin = user?.email?.includes('admin') || user?.email === 'testuser02@email.com';

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

  const runTest = async (testName: string, testFn: () => Promise<string>) => {
    const startTime = Date.now();
    setTests(prev => prev.map(t => 
      t.name === testName ? { ...t, status: 'pending' as const } : t
    ));

    try {
      const message = await testFn();
      const duration = Date.now() - startTime;
      setTests(prev => prev.map(t => 
        t.name === testName 
          ? { ...t, status: 'success' as const, message, duration }
          : t
      ));
    } catch (error) {
      const duration = Date.now() - startTime;
      setTests(prev => prev.map(t => 
        t.name === testName 
          ? { 
              ...t, 
              status: 'error' as const, 
              message: error instanceof Error ? error.message : 'Unknown error',
              duration 
            }
          : t
      ));
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    // Initialize tests
    const initialTests: TestResult[] = [
      { name: 'Database Connection', status: 'pending', message: 'Testing...' },
      { name: 'Movies Table', status: 'pending', message: 'Testing...' },
      { name: 'Categories Table', status: 'pending', message: 'Testing...' },
      { name: 'Tags Table', status: 'pending', message: 'Testing...' },
      { name: 'User Profile', status: 'pending', message: 'Testing...' },
      { name: 'Cache Test', status: 'pending', message: 'Testing...' },
    ];
    setTests(initialTests);

    const supabase = createClient();

    // Test 1: Database Connection
    await runTest('Database Connection', async () => {
      const { error } = await supabase.from('movies').select('count').limit(1);
      if (error) throw error;
      return 'Connection successful';
    });

    // Test 2: Movies Table
    await runTest('Movies Table', async () => {
      const { data, error } = await supabase.from('movies').select('*').limit(5);
      if (error) throw error;
      return `Found ${data?.length || 0} movies (showing first 5)`;
    });

    // Test 3: Categories Table
    await runTest('Categories Table', async () => {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      return `Found ${data?.length || 0} categories`;
    });

    // Test 4: Tags Table
    await runTest('Tags Table', async () => {
      const { data, error } = await supabase.from('tags').select('*');
      if (error) throw error;
      return `Found ${data?.length || 0} tags`;
    });

    // Test 5: User Profile
    await runTest('User Profile', async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data ? 'Profile exists' : 'No profile found (normal for new users)';
    });

    // Test 6: Cache Test
    await runTest('Cache Test', async () => {
      const testKey = 'admin-test-cache';
      const testValue = { timestamp: Date.now(), test: true };
      
      // Test localStorage
      localStorage.setItem(testKey, JSON.stringify(testValue));
      const retrieved = JSON.parse(localStorage.getItem(testKey) || '{}');
      localStorage.removeItem(testKey);
      
      if (retrieved.test !== true) throw new Error('Cache test failed');
      return 'localStorage working correctly';
    });

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Loader className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
    }
  };

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
              <Database className="w-6 h-6 text-yellow-500" />
              <h1 className="text-xl font-semibold">Database Testing</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Database Health Check</h2>
          <p className="text-gray-600">Test database connections and verify data integrity.</p>
        </div>

        {/* Run Tests Button */}
        <div className="mb-8">
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-black px-6 py-3 rounded-md font-medium transition-colors"
          >
            <Play className="w-5 h-5" />
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </button>
        </div>

        {/* Test Results */}
        {tests.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Test Results</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {tests.map((test, index) => (
                <div key={index} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <h4 className="font-medium text-gray-900">{test.name}</h4>
                        <p className={`text-sm ${getStatusColor(test.status)}`}>
                          {test.message}
                        </p>
                      </div>
                    </div>
                    {test.duration && (
                      <span className="text-sm text-gray-500">
                        {test.duration}ms
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                alert('All browser cache cleared!');
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
            >
              Clear All Browser Cache
            </button>
            <button 
              onClick={() => {
                console.log('User:', user);
                console.log('localStorage keys:', Object.keys(localStorage));
                console.log('sessionStorage keys:', Object.keys(sessionStorage));
                alert('Check browser console for debug info');
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
            >
              Log Debug Info to Console
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
