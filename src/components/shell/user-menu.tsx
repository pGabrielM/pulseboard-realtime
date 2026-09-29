'use client'

import * as Dropdown from '@radix-ui/react-dropdown-menu'
import { ExternalLink, LogOut } from 'lucide-react'
import { logoutAction } from '@/lib/auth-actions'
import { siteConfig } from '@/config/site'
import { initials } from '@/lib/utils'

export function UserMenu({ name, email }: { name: string; email: string }) {
  return (
    <Dropdown.Root>
      <Dropdown.Trigger className="flex items-center gap-2 rounded-lg p-1 pr-2 text-left hover:bg-zinc-100 focus:outline-none">
        <span className="flex size-8 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
          {initials(name)}
        </span>
        <span className="hidden text-sm font-medium text-zinc-700 sm:block">{name}</span>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content
          align="end"
          sideOffset={6}
          className="z-50 w-60 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg"
        >
          <div className="px-2.5 py-2">
            <p className="truncate text-sm font-medium text-zinc-900">{name}</p>
            <p className="truncate text-xs text-zinc-500">{email}</p>
          </div>
          <Dropdown.Separator className="my-1 h-px bg-zinc-100" />
          <Dropdown.Item asChild>
            <a
              href={siteConfig.repositoryUrl}
              target="_blank"
              rel="noreferrer"
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-zinc-700 outline-none hover:bg-zinc-100"
            >
              <ExternalLink className="size-4" /> Código no GitHub
            </a>
          </Dropdown.Item>
          <Dropdown.Item
            onSelect={() => void logoutAction()}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-zinc-700 outline-none hover:bg-zinc-100"
          >
            <LogOut className="size-4" /> Sair
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  )
}
