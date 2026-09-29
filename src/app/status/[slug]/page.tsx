import { CheckCircle2, XCircle } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Logo } from '@/components/logo'
import { duration, formatDate, formatUptime } from '@/lib/format'
import { getPublicStatus } from '@/lib/queries'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const data = await getPublicStatus((await params).slug)
  return { title: data?.page.title ?? 'Status' }
}

function dayColor(uptime: number | null) {
  if (uptime === null) return 'bg-zinc-200'
  if (uptime >= 99.5) return 'bg-emerald-500'
  if (uptime >= 95) return 'bg-amber-400'
  return 'bg-red-500'
}

export default async function PublicStatusPage({ params }: Params) {
  const data = await getPublicStatus((await params).slug)
  if (!data) notFound()
  const down = data.monitors.filter((monitor) => monitor.status === 'DOWN')

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-semibold tracking-tight">{data.page.title}</h1>
        {data.page.description && <p className="mt-1 text-zinc-600">{data.page.description}</p>}

        <div className={cn('mt-8 flex items-center gap-3 rounded-xl p-5 text-white shadow-sm', down.length ? 'bg-red-600' : 'bg-emerald-600')}>
          {down.length ? <XCircle className="size-6" /> : <CheckCircle2 className="size-6" />}
          <p className="text-lg font-medium">
            {down.length ? `Instabilidade em ${down.map((monitor) => monitor.name).join(', ')}` : 'Todos os sistemas operacionais'}
          </p>
        </div>

        <div className="mt-6 divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white shadow-sm">
          {data.monitors.map((monitor) => (
            <div key={monitor.id} className="p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="font-medium">{monitor.name}</p>
                <p className="text-sm text-zinc-500">
                  <span className={monitor.status === 'DOWN' ? 'font-medium text-red-600' : 'font-medium text-emerald-600'}>
                    {monitor.status === 'DOWN' ? 'Fora do ar' : monitor.status === 'PAUSED' ? 'Em manutenção' : 'Operacional'}
                  </span>
                  {' · '}
                  {formatUptime(monitor.uptime90)} em 90 dias
                </p>
              </div>
              <div className="flex h-8 gap-[2px]">
                {monitor.daily.map((day) => (
                  <span
                    key={day.day.toISOString()}
                    title={`${formatDate(day.day, 'dd/MM/yyyy')}: ${day.uptime === null ? 'sem dados' : formatUptime(day.uptime)}`}
                    className={cn('flex-1 rounded-[2px]', dayColor(day.uptime))}
                  />
                ))}
              </div>
              <div className="mt-1.5 flex justify-between text-[11px] text-zinc-400">
                <span>90 dias atrás</span>
                <span>hoje</span>
              </div>
            </div>
          ))}
        </div>

        <h2 className="mt-10 mb-3 text-sm font-semibold text-zinc-700">Incidentes nos últimos 30 dias</h2>
        {data.incidents.length === 0 ? (
          <p className="rounded-xl border border-zinc-200 bg-white p-5 text-sm text-zinc-500">Nenhum incidente registrado.</p>
        ) : (
          <ul className="space-y-2">
            {data.incidents.map((incident) => (
              <li key={incident.id} className="rounded-xl border border-zinc-200 bg-white p-4 text-sm">
                <p className="font-medium">
                  {incident.monitor.name} — {incident.resolvedAt ? 'resolvido' : 'em andamento'}
                </p>
                <p className="text-zinc-500">
                  {formatDate(incident.startedAt)} · duração {duration(incident.startedAt, incident.resolvedAt ?? new Date())}
                </p>
              </li>
            ))}
          </ul>
        )}

        <Link href="/" className="mx-auto mt-12 flex w-fit items-center gap-2 text-xs text-zinc-400 hover:text-zinc-600">
          Monitorado com <Logo />
        </Link>
      </main>
    </div>
  )
}
