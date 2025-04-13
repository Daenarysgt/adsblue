import { colors } from '@/app/constants/colors'

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  variant?: 'primary' | 'secondary'
}

export default function AuthButton({ 
  children, 
  loading, 
  variant = 'primary',
  className = '', 
  ...props 
}: AuthButtonProps) {
  const baseStyles = `
    relative w-full flex justify-center py-2.5 px-4 text-sm font-semibold
    rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors duration-200
  `

  const variantStyles = {
    primary: `
      bg-primary-600 text-white hover:bg-primary-500
      focus-visible:outline-primary-600
    `,
    secondary: `
      bg-white text-secondary-900 ring-1 ring-inset ring-secondary-300
      hover:bg-secondary-50 focus-visible:outline-secondary-600
    `
  }

  return (
    <button
      {...props}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-lg">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <span className={loading ? 'invisible' : ''}>
        {children}
      </span>
    </button>
  )
} 