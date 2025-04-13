'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AuthInput } from '@/components/ui/auth-input'
import { AuthButton } from '@/components/ui/auth-button'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setSuccessMessage('Email verificado com sucesso! Faça login para continuar.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        if (signInError.message.includes('Email not confirmed')) {
          // Se o email não foi confirmado, reenvia o código
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email,
          })
          
          if (resendError) throw resendError

          // Armazena o email e redireciona para verificação
          sessionStorage.setItem('verificationEmail', email)
          router.push(`/auth/verify-code?email=${encodeURIComponent(email)}`)
          return
        }
        throw signInError
      }

      // Login bem sucedido
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          Entrar na sua conta
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Ou{' '}
          <Link 
            href="/auth/register" 
            className="text-[var(--accent-purple)] hover:text-[var(--accent-indigo)] transition-colors"
          >
            criar uma nova conta
          </Link>
        </p>
      </div>

      {successMessage && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-sm text-emerald-500">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Email"
          type="email"
          placeholder="Digite seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <div className="space-y-4">
          <AuthInput
            label="Senha"
            type="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <Link 
            href="/auth/forgot-password"
            className="block text-right text-sm text-[var(--accent-purple)] hover:text-[var(--accent-indigo)] transition-colors"
          >
            Esqueceu sua senha?
          </Link>
        </div>

        <AuthButton loading={loading}>
          Entrar
        </AuthButton>
      </form>
    </div>
  )
} 