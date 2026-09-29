import { ExternalLink, Globe } from 'lucide-react'
import type { Metadata } from 'next'
import { ConfirmButton } from '@/components/confirm-button'
import { StatusDot } from '@/components/monitors/status-dot'
import { PageHeader } from '@/components/shell/page-header'
import { StatusPageForm } from '@/components/status/status-page-form'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { deleteStatusPage } from '@/lib/actions'
import { prisma } from '@/lib/prisma'
import { getStatusPages } from '@/lib/queries'
import { requireUser } from '@/lib/session'

export const metadata: Metadata = { title: 'Páginas de status' }

export default async function StatusPagesPage() {
  const user = await requireUser()
  const [pages, monitors] = await Promise.all([
    getStatusPages(user.id),
    prisma.monitor.findMany({ where: { ownerId: user.id }, select: { id: true, name: true }, orderBy: { createdAt: 'asc' } }),
  ])

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Páginas de status"
        description="Mostre publicamente a disponibilidade dos seus serviços, com 90 dias de histórico."
        actions={<StatusPageForm monitors={monitors} />}
      />
      {pages.length === 0 ? (
        <EmptyState icon={Globe} title="Nenhuma página" description="Crie uma página de status para compartilhar com clientes." action={<StatusPageForm monitors={monitors} />} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {pages.map((page) => {
            const down = page.monitors.some((monitor) => monitor.status === 'DOWN')
            return (
              <div key={page.id} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold">{page.title}</h2>
                    <p className="font-mono text-xs text-zinc-500">/status/{page.slug}</p>
                  </div>
                  <StatusDot status={down ? 'DOWN' : 'UP'} />
                </div>
                {page.description && <p className="mt-2 text-sm text-zinc-600">{page.description}</p>}
                <p className="mt-3 text-xs text-zinc-500">{page.monitors.map((monitor) => monitor.name).join(' · ') || 'Nenhum monitor'}</p>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-100 pt-4">
                  <Button asChild size="sm">
                    <a href={`/status/${page.slug}`} target="_blank" rel="noreferrer">
                      <ExternalLink /> Abrir
                    </a>
                  </Button>
                  <StatusPageForm monitors={monitors} page={page} />
                  <ConfirmButton compact title="Excluir página?" description="O link público deixa de funcionar." action={deleteStatusPage.bind(null, page.id)} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
