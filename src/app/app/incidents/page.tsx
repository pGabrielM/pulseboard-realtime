import { CheckCircle2, ShieldCheck, XCircle } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/shell/page-header'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { duration, formatDate } from '@/lib/format'
import { getIncidents } from '@/lib/queries'
import { requireUser } from '@/lib/session'

export const metadata: Metadata = { title: 'Incidentes' }

export default async function IncidentsPage() {
  const user = await requireUser()
  const incidents = await getIncidents(user.id)
  const open = incidents.filter((incident) => !incident.resolvedAt)
  const resolved = incidents.filter((incident) => incident.resolvedAt)
  const mttr = resolved.length
    ? resolved.reduce((sum, incident) => sum + (incident.resolvedAt!.getTime() - incident.startedAt.getTime()), 0) / resolved.length
    : null

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Incidentes"
        description="Abertos automaticamente após duas falhas seguidas e resolvidos na primeira checagem bem-sucedida."
      />
      {incidents.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="Nenhum incidente" description="Quando um monitor cair, o incidente aparece aqui com duração e causa." />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <p className="text-2xl font-semibold text-red-600 tabular-nums">{open.length}</p>
              <p className="text-xs text-zinc-500">Em andamento</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <p className="text-2xl font-semibold tabular-nums">{resolved.length}</p>
              <p className="text-xs text-zinc-500">Resolvidos</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <p className="text-2xl font-semibold tabular-nums">{mttr === null ? '—' : duration(0, mttr)}</p>
              <p className="text-xs text-zinc-500">Tempo médio de recuperação</p>
            </div>
          </div>
          <ul className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            {incidents.map((incident) => (
              <li key={incident.id} className="flex items-start gap-4 px-5 py-4">
                {incident.resolvedAt ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" /> : <XCircle className="mt-0.5 size-5 shrink-0 text-red-500" />}
                <div className="min-w-0 flex-1">
                  <Link href={`/app/monitors/${incident.monitor.id}`} className="font-medium text-zinc-900 hover:underline">
                    {incident.monitor.name}
                  </Link>
                  <p className="text-sm text-zinc-600">{incident.cause}</p>
                  <p className="mt-1 text-xs text-zinc-500">Início {formatDate(incident.startedAt)}</p>
                </div>
                <div className="text-right">
                  {incident.resolvedAt ? (
                    <Badge tone="green">Resolvido</Badge>
                  ) : (
                    <Badge tone="red">Em andamento</Badge>
                  )}
                  <p className="mt-1 text-xs text-zinc-500">
                    {duration(incident.startedAt, incident.resolvedAt ?? new Date())}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
