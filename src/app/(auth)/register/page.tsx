import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AuthForm } from '@/components/auth/auth-form'
import { AuthShell } from '@/components/auth/auth-shell'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = { title: 'Criar conta' }

export default async function RegisterPage() {
  if ((await auth())?.user) redirect('/app')
  return (
    <AuthShell title="Criar conta" subtitle={`Comece a usar o ${siteConfig.name} em segundos.`}>
      <AuthForm mode="register" />
    </AuthShell>
  )
}
