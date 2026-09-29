import Link from 'next/link'
import { Github } from '@/components/marketing/github-icon'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/config/site'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-zinc-600 md:flex">
          <a href="#recursos" className="hover:text-zinc-900">
            Recursos
          </a>
          <a href="#como-funciona" className="hover:text-zinc-900">
            Como funciona
          </a>
          <a href="#stack" className="hover:text-zinc-900">
            Tecnologia
          </a>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex">
            <a href={siteConfig.repositoryUrl} target="_blank" rel="noreferrer" aria-label="GitHub">
              <Github className="size-5" />
            </a>
          </Button>
          <Button asChild variant="secondary" className="hidden sm:inline-flex">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild>
            <Link href="/login">Testar demo</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
