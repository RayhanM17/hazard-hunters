import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hazard Hunters',
  description: 'Gamified road-hazard reporting',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-white">
        <nav className="border-b border-gray-800 px-6 py-3 flex gap-6 items-center">
          <span className="font-bold text-lg">🚗 Hazard Hunters</span>
          <Link href="/" className="text-sm hover:text-white text-gray-400">
            Dashboard
          </Link>
          <Link href="/leaderboard" className="text-sm hover:text-white text-gray-400">
            Leaderboard
          </Link>
        </nav>
        <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  )
}
