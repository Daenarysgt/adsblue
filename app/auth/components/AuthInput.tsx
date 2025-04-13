import { colors } from '@/app/constants/colors'

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export default function AuthInput({ label, error, className = '', ...props }: AuthInputProps) {
  return (
    <div>
      <label htmlFor={props.id} className="block text-sm font-medium text-secondary-700">
        {label}
      </label>
      <div className="mt-1">
        <input
          {...props}
          className={`
            block w-full rounded-lg border-0 py-2.5 px-3 text-secondary-900 shadow-sm 
            ring-1 ring-inset ring-secondary-200 
            placeholder:text-secondary-400
            focus:ring-2 focus:ring-inset focus:ring-primary-500
            ${error ? 'ring-error-500 focus:ring-error-500' : ''}
            ${className}
          `}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-error-500">
          {error}
        </p>
      )}
    </div>
  )
} 