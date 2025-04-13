import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { redirect } from 'next/navigation'

export async function logout() {
  const supabase = createClientComponentClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
} 