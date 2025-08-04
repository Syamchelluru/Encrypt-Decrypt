'use client'

import React from 'react'
import Link from 'next/link'
import { MapPin, Mail, Phone, Github, Twitter, Linkedin } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    platform: [
      { name: 'Home', href: '/' },
      { name: 'Issues', href: '/issues' },
      { name: 'Map View', href: '/map' },
      { name: 'Create Issue', href: '/create' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Community Guidelines', href: '/guidelines' },
      { name: 'Report Bug', href: '/bug-report' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Accessibility', href: '/accessibility' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Our Mission', href: '/mission' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press Kit', href: '/press' },
    ],
  }

  const socialLinks = [
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'LinkedIn', href: '#', icon: Linkedin },
    { name: 'GitHub', href: '#', icon: Github },
  ]

  return (
    <footer className="bg-secondary-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="text-3xl">🏘️</div>
                <span className="text-2xl font-bold">Fix My Area</span>
              </div>
              
              <p className="text-secondary-300 mb-6 max-w-md">
                Empowering communities to report and track civic issues. 
                Together, we can make our neighborhoods better places to live.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-secondary-300">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">support@fixmyarea.com</span>
                </div>
                <div className="flex items-center space-x-3 text-secondary-300">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3 text-secondary-300">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">San Francisco, CA</span>
                </div>
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Platform
              </h3>
              <ul className="space-y-3">
                {footerLinks.platform.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-secondary-300 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Support
              </h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-secondary-300 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Legal
              </h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-secondary-300 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Company
              </h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-secondary-300 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="py-8 border-t border-secondary-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Stay Updated
              </h3>
              <p className="text-secondary-300 text-sm">
                Get notified about new features and community updates.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-secondary-800 border border-secondary-700 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="py-6 border-t border-secondary-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-secondary-400 text-sm">
              © {currentYear} Fix My Area. All rights reserved.
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <span className="text-secondary-400 text-sm mr-2">Follow us:</span>
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-secondary-400 hover:text-white transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>

            {/* Made with love */}
            <div className="text-secondary-400 text-sm flex items-center space-x-1">
              <span>Made with</span>
              <span className="text-red-500">❤️</span>
              <span>for communities</span>
            </div>
          </div>
        </div>

        {/* App Download Section */}
        <div className="py-6 border-t border-secondary-800">
          <div className="text-center">
            <p className="text-secondary-400 text-sm mb-4">
              Coming soon to mobile devices
            </p>
            <div className="flex justify-center space-x-4">
              <div className="px-4 py-2 bg-secondary-800 rounded-lg border border-secondary-700">
                <div className="flex items-center space-x-2">
                  <div className="text-2xl">📱</div>
                  <div>
                    <div className="text-xs text-secondary-400">Download on the</div>
                    <div className="text-sm font-semibold text-white">App Store</div>
                  </div>
                </div>
              </div>
              
              <div className="px-4 py-2 bg-secondary-800 rounded-lg border border-secondary-700">
                <div className="flex items-center space-x-2">
                  <div className="text-2xl">🤖</div>
                  <div>
                    <div className="text-xs text-secondary-400">Get it on</div>
                    <div className="text-sm font-semibold text-white">Google Play</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

