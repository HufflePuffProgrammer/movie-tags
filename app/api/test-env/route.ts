import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET() {
  logger.api('/test-env', 'Testing environment variables');
  
  const envCheck = {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasTmdbKey: !!process.env.TMDB_API_KEY,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
    nodeEnv: process.env.NODE_ENV,
  };

  logger.info('Environment Check:', envCheck);

  return NextResponse.json({
    message: 'Environment variables check',
    ...envCheck,
    timestamp: new Date().toISOString()
  });
}
