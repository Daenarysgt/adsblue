import { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background-dark)]">
      {/* Logo */}
      <div className="fixed top-8 left-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[var(--accent-purple)] flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
          </svg>
        </div>
        <span className="text-[var(--text-primary)] text-xl font-semibold">Copilot Ads</span>
      </div>

      {/* Auth Container */}
      <div className="w-full max-w-md p-8">
        <div className="glass-effect rounded-2xl p-8">
          {children}
        </div>
      </div>

      {/* Background Gradient Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
      </div>
    </div>
  )
} 