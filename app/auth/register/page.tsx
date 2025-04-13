'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { AuthInput } from '@/components/ui/auth-input'
import { AuthButton } from '@/components/ui/auth-button'

export default function Register() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    try {
      setLoading(true)

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`
        }
      })

      if (signUpError) {
        // Se o erro for de usuário já existente, tenta reenviar o código
        if (signUpError.message.includes('User already registered')) {
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email,
          })
          
          if (resendError) throw resendError
        } else {
          throw signUpError
        }
      }

      // Armazena o email antes de redirecionar
      sessionStorage.setItem('verificationEmail', email)
      router.push(`/auth/verify-code?email=${encodeURIComponent(email)}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          Criar uma nova conta
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Ou{' '}
          <Link 
            href="/auth/login" 
            className="text-[var(--accent-purple)] hover:text-[var(--accent-indigo)] transition-colors"
          >
            entrar na sua conta
          </Link>
        </p>
      </div>

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
        
        <AuthInput
          label="Senha"
          type="password"
          placeholder="Digite sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <AuthInput
          label="Confirmar senha"
          type="password"
          placeholder="Confirme sua senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <AuthButton loading={loading}>
          Criar conta
        </AuthButton>
      </form>
    </div>
  )
} 