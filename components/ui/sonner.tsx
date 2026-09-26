'use client'

import { Toaster as Sonner } from 'sonner'

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            'rounded-2xl border border-slate-800 bg-slate-900 text-slate-100 shadow-lg',
          title: 'font-sans font-medium',
          description: 'text-slate-400',
        },
      }}
    />
  )
}
