import { signIn } from '@/auth'
import { siteConfig } from '@/config/site'

// Entrada direta na conta demo (credenciais públicas do README): usada pelo botão "Testar demo" do portfólio.
export const dynamic = 'force-dynamic'

export async function GET() {
  await signIn('credentials', {
    email: siteConfig.demo.email,
    password: siteConfig.demo.password,
    redirectTo: '/app',
  })
}
