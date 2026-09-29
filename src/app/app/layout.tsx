import Link from 'next/link'
import type { ReactNode } from 'react'
import { Logo } from '@/components/logo'
import { TopNav, UtcClock } from '@/components/shell/top-nav'
import { UserMenu } from '@/components/shell/user-menu'
import { siteConfig } from '@/config/site'
import { requireUser } from '@/lib/session'

// Layout "console": barra superior com abas, sem sidebar — o conteúdo usa toda a largura.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser()
  const isDemo = user.email === siteConfig.demo.email

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-zinc-50/90 backdrop-blur">
        <div className="mx-auto flex h-12 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link href="/app">
            <Logo />
          </Link>
          <span className="hidden h-4 w-px bg-zinc-200 sm:block" />
          <span className="hidden items-center gap-1.5 font-mono text-[11px] tracking-wider text-brand-500 uppercase sm:flex">
            <span className="size-1.5 animate-pulse rounded-full bg-brand-500" />
            monitorando
          </span>
          <div className="ml-auto flex items-center gap-4">
            <UtcClock />
            <UserMenu name={user.name} email={user.email} />
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-2 sm:px-4">
          <TopNav />
        </div>
      </header>
      {isDemo && (
        <div className="border-b border-zinc-200 bg-brand-50 px-4 py-1.5 text-center font-mono text-[11px] tracking-wide text-brand-700">
          CONTA DEMO — crie, pause e apague monitores à vontade. As checagens são reais.
        </div>
      )}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  )
}
