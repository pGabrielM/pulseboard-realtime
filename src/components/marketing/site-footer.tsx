import { Logo } from '@/components/logo'
import { siteConfig } from '@/config/site'

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <Logo compact />
          <span>© {new Date().getFullYear()} · Open source (MIT)</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <a href={siteConfig.repositoryUrl} target="_blank" rel="noreferrer" className="hover:text-zinc-900">
            Código-fonte
          </a>
          <span>
            Desenvolvido por{' '}
            <a
              href={siteConfig.author.url}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-zinc-800 hover:underline"
            >
              {siteConfig.author.name}
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}
