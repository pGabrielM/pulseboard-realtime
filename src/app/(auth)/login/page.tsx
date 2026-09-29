import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AuthForm } from '@/components/auth/auth-form'
import { AuthShell } from '@/components/auth/auth-shell'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = { title: 'Entrar' }

export default async function LoginPage() {
  if ((await auth())?.user) redirect('/app')
  return (
    <AuthShell title={`Entrar no ${siteConfig.name}`} subtitle="Bem-vindo de volta.">
      <AuthForm mode="login" />
    </AuthShell>
  )
}
