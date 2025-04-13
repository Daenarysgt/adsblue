'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useSearchParams } from 'next/navigation'

export default function VerifyCode() {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(60)
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0]
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const newCode = [...code]
      newCode[index - 1] = ''
      setCode(newCode)
      const prevInput = document.getElementById(`code-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newCode = [...code]
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newCode[index] = char
    })
    setCode(newCode)
  }

  const handleVerify = async () => {
    setError(null)
    setLoading(true)

    try {
      const token = code.join('')
      if (token.length !== 6) {
        throw new Error('Por favor, insira o código completo de 6 dígitos')
      }

      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email!,
        token,
        type: 'signup'
      })

      if (verifyError) throw verifyError

      // Redirect to login page on success
      router.push('/auth/login?verified=true')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao verificar o código')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email!,
      })

      if (resendError) throw resendError

      setCountdown(60)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reenviar o código')
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Verificar email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Digite o código de 6 dígitos enviado para {email}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="sr-only">Código de verificação</label>
              <div className="flex justify-between gap-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="block h-12 w-12 rounded-md border border-gray-300 text-center text-lg shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                ))}
              </div>
            </div>

            <div>
              <button
                onClick={handleVerify}
                disabled={loading || code.some(digit => !digit)}
                className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Verificando...' : 'Verificar'}
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={handleResendCode}
                disabled={countdown > 0}
                className="text-sm font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
              >
                {countdown > 0
                  ? `Reenviar código em ${countdown}s`
                  : 'Reenviar código'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 