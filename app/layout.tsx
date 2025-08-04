import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Fix My Area - Civic Issue Reporting Platform',
  description: 'Report and track civic issues in your community. Help make your area better by reporting problems and tracking their resolution.',
  keywords: 'civic issues, community, reporting, local government, infrastructure, public services',
  authors: [{ name: 'Fix My Area Team' }],
  openGraph: {
    title: 'Fix My Area - Civic Issue Reporting Platform',
    description: 'Report and track civic issues in your community',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fix My Area - Civic Issue Reporting Platform',
    description: 'Report and track civic issues in your community',
  },
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50`}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#333',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}

