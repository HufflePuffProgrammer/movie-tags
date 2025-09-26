'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Camera, Save, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'

interface Profile {
  id: string
  user_name: string
  full_name: string
  email: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Form state
  const [userName, setUserName] = useState('')
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarError, setAvatarError] = useState(false)
  
  // Debug avatar URL changes
  const setAvatarUrlWithDebug = (value: string) => {
    console.log('Setting avatar URL to:', value)
    console.trace('Avatar URL setter called from:')
    setAvatarUrl(value)
    setAvatarError(false) // Reset error when URL changes
  }

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const createProfile = useCallback(async () => {
    try {
      const newProfile = {
        id: user?.id,
        user_name: user?.user_metadata?.user_name || user?.email?.split('@')[0] || 'newuser',
        full_name: user?.user_metadata?.full_name || user?.user_metadata?.display_name || 'New User',
        email: user?.email,
        avatar_url: null,
        bio: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single()

      if (error) {
        console.error('Error creating profile:', error)
        setError('Failed to create profile')
      } else {
        console.log('Profile created successfully:', data)
        
        // Cache the new profile
        if (user?.id) {
          sessionStorage.setItem(`user-profile-${user.id}`, JSON.stringify(data))
        }
        
        setProfile(data)
        setUserName(data.user_name || '')
        setFullName(data.full_name || '')
        setBio(data.bio || '')
        setAvatarUrlWithDebug(data.avatar_url || '')
      }
    } catch (err) {
      console.error('Profile creation error:', err)
      setError('Failed to create profile')
    }
  }, [user?.id, user?.user_metadata, user?.email])
  
  const loadProfile = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true)
      
      // Check sessionStorage cache first (unless forcing refresh)
      if (!forceRefresh && user?.id) {
        const cached = sessionStorage.getItem(`user-profile-${user.id}`)
        if (cached) {
          const cachedProfile = JSON.parse(cached)
          setProfile(cachedProfile)
          setUserName(cachedProfile.user_name || '')
          setFullName(cachedProfile.full_name || '')
          setBio(cachedProfile.bio || '')
          setAvatarUrlWithDebug(cachedProfile.avatar_url || '')
          setLoading(false)
          console.log('Profile loaded from session cache')
          return
        }
      }
      
      // Fetch from database
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error) {
        console.error('Error loading profile:', error)
        
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating new profile...')
          await createProfile()
        } else {
          console.error('Profile loading error details:', error)
          setError(`Failed to load profile: ${error.message}`)
        }
      } else {
        console.log('Profile loaded from database:', data)
        console.log('Avatar URL from database:', data.avatar_url)
        
        // Cache the profile data
        if (user?.id) {
          sessionStorage.setItem(`user-profile-${user.id}`, JSON.stringify(data))
        }
        
        setProfile(data)
        setUserName(data.user_name || '')
        setFullName(data.full_name || '')
        setBio(data.bio || '')
        setAvatarUrlWithDebug(data.avatar_url || '')
      }
    } catch (err) {
      console.error('Profile loading error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [user?.id, createProfile])

  // Load profile data
  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user, loadProfile])

  

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    // Validate required fields
    if (!userName.trim()) {
      setError('Username is required')
      setSaving(false)
      return
    }

    if (!fullName.trim()) {
      setError('Full name is required')
      setSaving(false)
      return
    }

    // Validate bio length
    if (bio.length > 500) {
      setError('Bio must be 500 characters or less')
      setSaving(false)
      return
    }

    try {
      const updateData = {
        user_name: userName.trim(),
        full_name: fullName.trim(),
        bio: bio.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        updated_at: new Date().toISOString()
      }
      
      console.log('Updating profile with data:', updateData)
      console.log('Avatar URL value:', avatarUrl)
      console.log('Avatar URL trimmed:', avatarUrl.trim())
      console.log('Avatar URL final:', avatarUrl.trim() || null)
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user?.id)

      if (error) {
        console.error('Error updating profile:', error)
        setError(`Failed to update profile: ${error.message}`)
      } else {
        console.log('Profile update successful')
        setSuccess('Profile updated successfully!')
        
        // Clear cache and reload fresh data
        if (user?.id) {
          sessionStorage.removeItem(`user-profile-${user.id}`)
        }
        loadProfile(true) // Force refresh from database
      }
    } catch (err) {
      console.error('Profile update error:', err)
      setError('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Profile Settings</h1>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Profile Header */}
          <div className="px-6 py-8 border-b border-gray-200">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {avatarUrl && !avatarError ? (
                    <img 
                      src={avatarUrl} 
                      alt="Profile1" 
                      className="w-full h-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 bg-yellow-500 hover:bg-yellow-600 text-black p-2 rounded-full shadow-lg transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Basic Info */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{profile?.full_name}</h2>
                <p className="text-gray-600 text-sm">@{profile?.user_name}</p>
                <p className="text-gray-600 flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Member since {profile ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="px-6 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error/Success Messages */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                  {success}
                </div>
              )}

              {/* Username */}
              <div>
                <label htmlFor="userName" className="block text-sm font-medium text-gray-800 mb-2">
                  Username *
                </label>
                <input
                  id="userName"
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-yellow-500 focus:ring-yellow-500 focus:outline-none text-gray-900"
                  placeholder="Enter your username"
                />
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-800 mb-2">
                  Full Name *
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-yellow-500 focus:ring-yellow-500 focus:outline-none text-gray-900"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email (Read-only) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  disabled
                  value={user.email || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-600 mt-1">Email cannot be changed from this page</p>
              </div>

              {/* Avatar URL */}
              <div>
                <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-800 mb-2">
                  Avatar URL
                </label>
                <input
                  id="avatarUrl"
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => {
                    setAvatarUrlWithDebug(e.target.value)
                    setAvatarError(false) // Reset error when user types
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-yellow-500 focus:ring-yellow-500 focus:outline-none text-gray-900"
                  placeholder="https://example.com/your-avatar.jpg"
                />
                <p className="text-xs text-gray-600 mt-1">Enter a URL to your profile picture</p>
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-800 mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-yellow-500 focus:ring-yellow-500 focus:outline-none resize-none text-gray-900"
                  placeholder="Tell us about yourself..."
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-600">Share a bit about yourself and your movie preferences</p>
                  <p className="text-xs text-gray-600">{bio.length}/500</p>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Account Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
          <div className="space-y-4">
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Change Password
            </button>
            <button className="text-red-600 hover:text-red-700 text-sm font-medium">
              Delete Account
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
