import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/lib/context/AppContext'
import { AuthProvider } from '@/lib/auth/auth-context'
import { Shell } from '@/components/layout/Shell'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'Resume Screening',
  description: 'A fair, explainable, and feedback-adaptive AI framework for candidate matching.',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f3f6f7',
  userScalable: true,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <AppProvider>
            <Shell>{children}</Shell>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
