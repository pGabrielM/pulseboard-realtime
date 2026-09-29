'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import {
  demoLoginAction,
  loginAction,
  registerAction,
  type AuthState,
} from '@/lib/auth-actions'
import { siteConfig } from '@/config/site'

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    mode === 'login' ? loginAction : registerAction,
    undefined,
  )
  const [demoState, demoAction, demoPending] = useActionState<AuthState, FormData>(
    async () => demoLoginAction(),
    undefined,
  )
  const error = state?.error ?? demoState?.error

  return (
    <div className="space-y-6">
      <form action={demoAction}>
        <Button type="submit" variant="dark" size="lg" className="w-full" disabled={demoPending}>
          <Sparkles />
          {demoPending ? 'Entrando…' : 'Explorar com a conta demo'}
        </Button>
        <p className="mt-2 text-center text-xs text-zinc-500">
          Sem cadastro: dados de exemplo prontos para testar tudo.
        </p>
      </form>

      <div className="flex items-center gap-3 text-xs text-zinc-400">
        <span className="h-px flex-1 bg-zinc-200" />
        ou com seu e-mail
        <span className="h-px flex-1 bg-zinc-200" />
      </div>

      <form action={formAction} className="space-y-4">
        {mode === 'register' && (
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" autoComplete="name" required minLength={2} />
          </div>
        )}
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div>
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
            minLength={mode === 'register' ? 8 : 1}
          />
        </div>
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar conta'}
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-500">
        {mode === 'login' ? (
          <>
            Ainda não tem conta?{' '}
            <Link href="/register" className="font-medium text-brand-700 hover:underline">
              Criar conta grátis
            </Link>
          </>
        ) : (
          <>
            Já tem conta?{' '}
            <Link href="/login" className="font-medium text-brand-700 hover:underline">
              Entrar
            </Link>
          </>
        )}
      </p>
      <p className="text-center text-xs text-zinc-400">
        Demo: {siteConfig.demo.email} · {siteConfig.demo.password}
      </p>
    </div>
  )
}
