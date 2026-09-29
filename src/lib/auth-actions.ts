'use server'

import bcrypt from 'bcryptjs'
import { AuthError } from 'next-auth'
import { z } from 'zod'
import { signIn, signOut } from '@/auth'
import { siteConfig } from '@/config/site'
import { prisma } from '@/lib/prisma'
import { onUserCreated } from '@/lib/onboarding'

export type AuthState = { error?: string } | undefined

async function attemptSignIn(email: string, password: string): Promise<AuthState> {
  try {
    await signIn('credentials', { email, password, redirectTo: '/app' })
  } catch (error) {
    if (error instanceof AuthError) return { error: 'E-mail ou senha inválidos.' }
    throw error
  }
}

export async function loginAction(_: AuthState, formData: FormData): Promise<AuthState> {
  return attemptSignIn(String(formData.get('email') ?? ''), String(formData.get('password') ?? ''))
}

export async function demoLoginAction(): Promise<AuthState> {
  return attemptSignIn(siteConfig.demo.email, siteConfig.demo.password)
}

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome.').max(80),
  email: z.string().trim().toLowerCase().email('E-mail inválido.'),
  password: z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres.').max(128),
})

export async function registerAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (exists) return { error: 'Já existe uma conta com este e-mail.' }

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
    },
  })
  await onUserCreated(user.id)

  return attemptSignIn(parsed.data.email, parsed.data.password)
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: '/' })
}
