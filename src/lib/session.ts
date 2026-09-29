import 'server-only'

import { redirect } from 'next/navigation'
import { auth } from '@/auth'

export async function requireUser(): Promise<{ id: string; name: string; email: string }> {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  return {
    id: session.user.id,
    name: session.user.name ?? 'Usuário',
    email: session.user.email ?? '',
  }
}
