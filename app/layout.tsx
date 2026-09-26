import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import Link from 'next/link'
import { Route } from 'lucide-react'
import { Toaster } from '@/components/ui/sonner'
import NavLinks from '@/components/NavLinks'
import AmbientBackground from '@/components/AmbientBackground'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'Hazard Hunters',
  description: 'Gamified road-hazard reporting',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-screen bg-slate-950 font-sans text-slate-100">
        <AmbientBackground />
        <nav className="flex items-center gap-6 border-b border-slate-800/80 bg-slate-950/60 px-6 py-3 backdrop-blur-sm">
          <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold text-slate-100">
            <Route size={20} className="text-indigo-500" />
            Hazard Hunters
          </Link>
          <NavLinks />
        </nav>
        <main className="relative mx-auto max-w-4xl px-4 py-8">{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
