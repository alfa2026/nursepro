'use client'

import { ReactNode } from 'react'
import { Toaster } from 'sonner'
import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '@/contexts/auth-context'
import { LangProvider } from '@/contexts/lang-context'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <LangProvider>
          {children}
          <Toaster position="top-center" />
        </LangProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
