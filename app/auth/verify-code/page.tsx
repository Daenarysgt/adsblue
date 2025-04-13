'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { AuthButton } from '@/components/ui/auth-button'
import { Mail } from 'lucide-react'

export default function VerifyCode() {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Recupera o email da URL ou sessionStorage
    const emailParam = searchParams.get('email')
    const storedEmail = sessionStorage.getItem('verificationEmail')
    
    if (emailParam) {
      setEmail(emailParam)
      sessionStorage.setItem('verificationEmail', emailParam)
    } else if (storedEmail) {
      setEmail(storedEmail)
    }
  }, [searchParams])

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return // Permite apenas 1 dígito
    
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto focus no próximo input
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[name="code-${index + 1}"]`) as HTMLInputElement
      if (nextInput) nextInput.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Permite voltar com backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.querySelector(`input[name="code-${index - 1}"]`) as HTMLInputElement
      if (prevInput) prevInput.focus()
    }
  }

  const handleVerifyCode = async () => {
    if (!email) {
      setError('Email não encontrado. Por favor, tente cadastrar novamente.')
      return
    }

    const verificationCode = code.join('')
    if (verificationCode.length !== 6) {
      setError('Por favor, insira o código completo')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: 'signup'
      })
      
      if (error) throw error

      // Limpa o email armazenado
      sessionStorage.removeItem('verificationEmail')
      
      // Redireciona para o login com mensagem de sucesso
      router.push('/auth/login?verified=true')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao verificar código')
    } finally {
      setLoading(false)
    }
  }

  // Se não houver email, mostra mensagem de erro em vez de redirecionar
  if (!email) {
    return (
      <div className="space-y-6 text-center">
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-500">
            Nenhum email encontrado para verificação. Por favor,{' '}
            <button 
              onClick={() => router.push('/auth/register')}
              className="text-[var(--accent-purple)] hover:text-[var(--accent-indigo)] transition-colors"
            >
              tente cadastrar novamente
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="w-12 h-12 rounded-full bg-[var(--accent-purple)]/10 flex items-center justify-center">
          <Mail className="w-6 h-6 text-[var(--accent-purple)]" />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          Verifique seu email
        </h1>
        <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
          Digite o código de 6 dígitos que enviamos para{' '}
          <span className="text-[var(--text-primary)]">{email}</span>
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      <div className="flex justify-center gap-2">
        {code.map((digit, index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            name={`code-${index}`}
            value={digit}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="
              w-12 h-12 text-center text-lg font-medium
              rounded-lg auth-input
              text-[var(--text-primary)]
              focus:ring-2 focus:ring-[var(--accent-purple)]
            "
            maxLength={1}
            pattern="[0-9]"
          />
        ))}
      </div>

      <div className="space-y-4">
        <AuthButton 
          onClick={handleVerifyCode}
          loading={loading}
        >
          Verificar código
        </AuthButton>

        <p className="text-xs text-[var(--text-tertiary)]">
          Não recebeu o código? Verifique sua caixa de spam ou{' '}
          <button 
            onClick={() => router.push('/auth/register')}
            className="text-[var(--accent-purple)] hover:text-[var(--accent-indigo)] transition-colors"
          >
            tente cadastrar novamente
          </button>
        </p>
      </div>
    </div>
  )
} 