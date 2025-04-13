import { ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  variant?: 'primary' | 'secondary'
}

export function AuthButton({ 
  children, 
  loading, 
  variant = 'primary',
  className = '',
  ...props 
}: AuthButtonProps) {
  return (
    <button
      className={`
        auth-button
        w-full px-4 py-3.5 rounded-xl
        font-medium text-[var(--text-primary)]
        flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variant === 'secondary' ? 'bg-[var(--card-bg)] hover:bg-[var(--input-bg)]' : ''}
        ${className}
      `}
      disabled={loading}
      {...props}
    >
      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
      {children}
    </button>
  )
} 