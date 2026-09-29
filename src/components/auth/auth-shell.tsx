import Link from 'next/link'
import type { ReactNode } from 'react'
import { Logo } from '@/components/logo'
import { siteConfig } from '@/config/site'

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Link href="/" className="w-fit">
          <Logo />
        </Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{title}</h1>
          <p className="mt-1 mb-8 text-sm text-zinc-500">{subtitle}</p>
          {children}
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-zinc-950 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,var(--color-brand-600),transparent_55%)] opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_90%,var(--color-brand-900),transparent_50%)]" />
        <div className="relative flex h-full flex-col justify-end p-12 text-white">
          <p className="max-w-md text-3xl leading-tight font-semibold tracking-tight">
            {siteConfig.tagline}
          </p>
          <ul className="mt-8 space-y-3 text-sm text-white/75">
            {siteConfig.highlights.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
