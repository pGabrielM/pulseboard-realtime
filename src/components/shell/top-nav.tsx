'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { appNav } from '@/config/nav'
import { cn } from '@/lib/utils'

export function TopNav() {
  const pathname = usePathname()
  return (
    <nav className="-mb-px flex gap-1 overflow-x-auto">
      {appNav.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 border-b-2 px-3 py-3 font-mono text-xs tracking-wider whitespace-nowrap uppercase transition-colors',
              active ? 'border-brand-500 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-800',
            )}
          >
            <item.icon className="size-3.5" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function UtcClock() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    const tick = () => setNow(new Date())
    const first = setTimeout(tick, 0)
    const id = setInterval(tick, 1000)
    return () => {
      clearTimeout(first)
      clearInterval(id)
    }
  }, [])
  return (
    <span className="hidden font-mono text-xs text-zinc-500 tabular-nums sm:inline">
      {now ? now.toISOString().slice(11, 19) : '--:--:--'} UTC
    </span>
  )
}
