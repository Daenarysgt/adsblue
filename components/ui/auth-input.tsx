import { InputHTMLAttributes } from 'react'

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function AuthInput({ label, error, className = '', ...props }: AuthInputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[var(--text-secondary)]">
        {label}
      </label>
      <input
        className={`
          auth-input
          w-full px-4 py-3 rounded-xl
          text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]
          outline-none
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500 mt-1.5">{error}</p>
      )}
    </div>
  )
} 