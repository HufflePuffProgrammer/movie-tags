'use client'

import { Film, User, LogOut } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

export default function Header() {
  const { user, signOut, loading } = useAuth();

  return (
    <header className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Film className="w-8 h-8 text-yellow-500" />
            <h1 className="text-xl font-bold">CineFind</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {user && (
              <Link href="/my-tags" className="text-gray-300 hover:text-white font-medium">
                My Tags
              </Link>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <Link 
                  href="/profile"
                  className="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm">{user.email}</span>
                </Link>
                <button 
                  onClick={signOut}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  href="/login"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
