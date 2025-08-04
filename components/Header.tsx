'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, MapPin, User, Settings, LogOut, Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './ui/Button'
import { cn } from '@/lib/utils'
import { AuthUser } from '@/types'
import toast from 'react-hot-toast'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Fetch current user
  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        setUser(null)
        toast.success('Logged out successfully')
        router.push('/')
      } else {
        toast.error('Failed to logout')
      }
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout')
    }
  }

  const navigation = [
    { name: 'Home', href: '/', current: pathname === '/' },
    { name: 'Issues', href: '/issues', current: pathname.startsWith('/issues') },
    { name: 'Map', href: '/map', current: pathname === '/map' },
    { name: 'About', href: '/about', current: pathname === '/about' },
  ]

  const userNavigation = user ? [
    { name: 'Dashboard', href: user.role === 'admin' ? '/dashboard/admin' : '/dashboard/user', icon: User },
    { name: 'Create Issue', href: '/create', icon: MapPin },
    { name: 'Settings', href: '/settings', icon: Settings },
  ] : []

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 glass backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-2xl">🏘️</div>
              <span className="text-xl font-bold text-gradient">
                Fix My Area
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary-600',
                  item.current
                    ? 'text-primary-600'
                    : 'text-secondary-700'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="h-8 w-20 bg-secondary-200 rounded animate-pulse" />
            ) : user ? (
              <div className="flex items-center space-x-2">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-danger-500 rounded-full text-xs text-white flex items-center justify-center">
                    3
                  </span>
                </Button>

                {/* User Dropdown */}
                <div className="relative group">
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 px-3"
                  >
                    <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-700">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{user.name}</span>
                  </Button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 glass-card rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-white/10">
                        <p className="text-sm font-medium text-secondary-900">{user.name}</p>
                        <p className="text-xs text-secondary-600">{user.email}</p>
                        {user.role === 'admin' && (
                          <span className="inline-block mt-1 px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded">
                            Admin
                          </span>
                        )}
                      </div>
                      
                      {userNavigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center px-4 py-2 text-sm text-secondary-700 hover:bg-white/10 transition-colors"
                        >
                          <item.icon className="h-4 w-4 mr-3" />
                          {item.name}
                        </Link>
                      ))}
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-danger-600 hover:bg-white/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-white/10 glass"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              {/* Navigation Links */}
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'block px-3 py-2 rounded-lg text-base font-medium transition-colors',
                      item.current
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-secondary-700 hover:bg-white/10'
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* User Section */}
              {loading ? (
                <div className="space-y-2">
                  <div className="h-10 bg-secondary-200 rounded animate-pulse" />
                  <div className="h-10 bg-secondary-200 rounded animate-pulse" />
                </div>
              ) : user ? (
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="flex items-center space-x-3 px-3">
                    <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-700">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-secondary-900">{user.name}</p>
                      <p className="text-xs text-secondary-600">{user.email}</p>
                    </div>
                  </div>

                  <nav className="space-y-2">
                    {userNavigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center px-3 py-2 rounded-lg text-base font-medium text-secondary-700 hover:bg-white/10 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <item.icon className="h-5 w-5 mr-3" />
                        {item.name}
                      </Link>
                    ))}
                    
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center w-full px-3 py-2 rounded-lg text-base font-medium text-danger-600 hover:bg-white/10 transition-colors"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Logout
                    </button>
                  </nav>
                </div>
              ) : (
                <div className="space-y-2 pt-4 border-t border-white/10">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

