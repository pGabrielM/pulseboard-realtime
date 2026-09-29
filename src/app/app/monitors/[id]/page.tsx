import { ArrowLeft, CheckCircle2, ExternalLink, XCircle } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LatencyChart } from '@/components/monitors/latency-chart'
import { MonitorControls } from '@/components/monitors/monitor-controls'
import { MonitorForm } from '@/components/monitors/monitor-form'
import { StatusDot, statusLabel } from '@/components/monitors/status-dot'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { INTERVALS } from '@/lib/intervals'
import { duration, formatDate, formatUptime, relative, uptimeColor } from '@/lib/format'
import { getMonitorDetail } from '@/lib/queries'
import { requireUser } from '@/lib/session'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Monitor' }
export const dynamic = 'force-dynamic'

export default async function MonitorPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  const detail = await getMonitorDetail(user.id, (await params).id)
  if (!detail) notFound()
  const { monitor } = detail
  const interval = INTERVALS.find((item) => item.value === monitor.intervalSeconds)?.label ?? `${monitor.intervalSeconds}s`

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/app" className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800">
        <ArrowLeft className="size-4" /> Monitores
      </Link>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <StatusDot status={monitor.status} />
            <h1 className="truncate text-xl font-semibold tracking-tight">{monitor.name}</h1>
            <Badge tone={monitor.status === 'UP' ? 'green' : monitor.status === 'DOWN' ? 'red' : 'neutral'}>{statusLabel(monitor.status)}</Badge>
          </div>
          <a href={monitor.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800">
            {monitor.url} <ExternalLink className="size-3.5" />
          </a>
          <p className="mt-2 text-xs text-zinc-500">
            {monitor.method} · espera HTTP {monitor.expectedStatus}
            {monitor.keyword ? ` · procura “${monitor.keyword}”` : ''} · a cada {interval}
            {monitor.lastCheckedAt ? ` · última checagem ${relative(monitor.lastCheckedAt)}` : ''}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <MonitorControls monitorId={monitor.id} paused={monitor.status === 'PAUSED'} />
          <MonitorForm monitor={monitor} />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {detail.uptimes.map((item) => (
          <div key={item.label} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className={cn('text-2xl font-semibold tabular-nums', uptimeColor(item.uptime))}>{formatUptime(item.uptime)}</p>
            <p className="text-xs text-zinc-500">Uptime {item.label}</p>
          </div>
        ))}
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-2xl font-semibold tabular-nums">{detail.avgLatency === null ? '—' : `${detail.avgLatency} ms`}</p>
          <p className="text-xs text-zinc-500">Latência média 24h</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tempo de resposta — últimas 24 horas</CardTitle>
        </CardHeader>
        <CardContent>
          <LatencyChart points={detail.recent24h} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Incidentes</CardTitle>
          </CardHeader>
          <CardContent>
            {detail.incidents.length === 0 ? (
              <p className="text-sm text-zinc-500">Nenhum incidente registrado. 🎉</p>
            ) : (
              <ul className="space-y-3">
                {detail.incidents.map((incident) => (
                  <li key={incident.id} className="flex gap-3">
                    {incident.resolvedAt ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" /> : <XCircle className="mt-0.5 size-4 shrink-0 text-red-500" />}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-900">{incident.cause}</p>
                      <p className="text-xs text-zinc-500">
                        {formatDate(incident.startedAt)} ·{' '}
                        {incident.resolvedAt ? `resolvido em ${duration(incident.startedAt, incident.resolvedAt)}` : `em andamento há ${duration(incident.startedAt, new Date())}`}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Últimas checagens</CardTitle>
          </CardHeader>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-zinc-100">
              {detail.lastChecks.map((check) => (
                <tr key={check.id}>
                  <td className="py-2 pl-5">
                    <span className={cn('inline-block size-2 rounded-full', check.ok ? 'bg-emerald-500' : 'bg-red-500')} />
                  </td>
                  <td className="px-3 py-2 text-zinc-500">{formatDate(check.checkedAt, 'dd/MM HH:mm:ss')}</td>
                  <td className="px-3 py-2 font-mono text-xs">{check.statusCode ?? '—'}</td>
                  <td className="truncate px-3 py-2 text-xs text-zinc-500">{check.error ?? ''}</td>
                  <td className="py-2 pr-5 text-right tabular-nums">{check.latencyMs !== null ? `${check.latencyMs} ms` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}
