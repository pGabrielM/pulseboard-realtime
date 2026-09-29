import Link from 'next/link'
import type { ReactNode } from 'react'
import { Logo } from '@/components/logo'
import { MobileNav } from '@/components/shell/mobile-nav'
import { SidebarNav } from '@/components/shell/sidebar-nav'
import { UserMenu } from '@/components/shell/user-menu'
import { siteConfig } from '@/config/site'
import { requireUser } from '@/lib/session'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser()
  const isDemo = user.email === siteConfig.demo.email

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-zinc-200 bg-white px-3 py-4 lg:flex">
        <Link href="/app" className="mb-6 px-2">
          <Logo />
        </Link>
        <SidebarNav />
        <div className="mt-auto rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-500">
          Projeto open source por{' '}
          <a href={siteConfig.author.url} className="font-medium text-zinc-700 hover:underline">
            {siteConfig.author.name}
          </a>
          .
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        {isDemo && (
          <div className="bg-zinc-900 px-4 py-1.5 text-center text-xs text-zinc-300">
            Você está na conta demo — fique à vontade para criar, editar e apagar dados.
          </div>
        )}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-zinc-200 bg-white/85 px-4 backdrop-blur sm:px-6">
          <MobileNav />
          <div className="lg:hidden">
            <Logo compact />
          </div>
          <div className="ml-auto">
            <UserMenu name={user.name} email={user.email} />
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
