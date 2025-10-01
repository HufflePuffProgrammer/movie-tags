import { createClient } from '@supabase/supabase-js'

// Debug environment variables
console.log('🔧 Supabase Server Config:', {
  hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// Server-side client with service role key for API routes (optional)
export const supabaseServer = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Server-side client with anon key for regular server operations
export const supabaseServerAnon = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log('✅ Supabase server clients initialized successfully')
