'use client'

import { Globe } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { MonitorRow } from '@/lib/queries'
import { formatUptime, uptimeColor } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Sparkline } from './sparkline'
import { StatusDot, statusLabel } from './status-dot'

function Ago({ iso, now }: { iso: string | null; now: number | null }) {
  if (!iso || now === null) return <>—</>
  const seconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000))
  if (seconds < 60) return <>há {seconds}s</>
  if (seconds < 3600) return <>há {Math.floor(seconds / 60)} min</>
  return <>há {Math.floor(seconds / 3600)} h</>
}

export function LiveMonitors({ initial }: { initial: MonitorRow[] }) {
  const [rows, setRows] = useState(initial)
  const [connected, setConnected] = useState(false)
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    const source = new EventSource('/app/stream')
    source.addEventListener('open', () => setConnected(true))
    source.addEventListener('error', () => setConnected(false))
    source.addEventListener('monitors', (event) => setRows(JSON.parse((event as MessageEvent).data)))
    return () => source.close()
  }, [])

  useEffect(() => {
    const tick = () => setNow(Date.now())
    const first = setTimeout(tick, 0)
    const interval = setInterval(tick, 1000)
    return () => {
      clearTimeout(first)
      clearInterval(interval)
    }
  }, [])

  const up = rows.filter((row) => row.status === 'UP').length
  const down = rows.filter((row) => row.status === 'DOWN').length
  const measured = rows.filter((row) => row.uptime24h !== null)
  const avgUptime = measured.length ? measured.reduce((sum, row) => sum + row.uptime24h!, 0) / measured.length : null
  const latencies = rows.filter((row) => row.avgLatency24h !== null)
  const avgLatency = latencies.length ? Math.round(latencies.reduce((sum, row) => sum + row.avgLatency24h!, 0) / latencies.length) : null

  return (
    <div>
      <div
        className={cn(
          'mb-6 flex items-center gap-4 rounded-xl border p-5',
          down ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50',
        )}
      >
        <StatusDot status={down ? 'DOWN' : 'UP'} />
        <div className="flex-1">
          <p className={cn('font-semibold', down ? 'text-red-900' : 'text-emerald-900')}>
            {down ? `${down} ${down === 1 ? 'monitor fora do ar' : 'monitores fora do ar'}` : 'Todos os sistemas operando normalmente'}
          </p>
          <p className={cn('text-sm', down ? 'text-red-700' : 'text-emerald-700')}>
            {up} de {rows.length} online · atualizado em tempo real
          </p>
        </div>
        <span
          className={cn(
            'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
            connected ? 'bg-white/70 text-emerald-700' : 'bg-white/70 text-zinc-500',
          )}
        >
          <span className={cn('size-1.5 rounded-full', connected ? 'animate-pulse bg-emerald-500' : 'bg-zinc-400')} />
          {connected ? 'Ao vivo' : 'Reconectando'}
        </span>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Online', value: `${up}/${rows.length}` },
          { label: 'Incidentes abertos', value: String(rows.filter((row) => row.openIncident).length) },
          { label: 'Uptime médio (24h)', value: formatUptime(avgUptime) },
          { label: 'Latência média (24h)', value: avgLatency === null ? '—' : `${avgLatency} ms` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-2xl font-semibold tracking-tight tabular-nums">{stat.value}</p>
            <p className="text-xs text-zinc-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <ul className="divide-y divide-zinc-100">
          {rows.map((row) => (
            <li key={row.id}>
              <Link href={`/app/monitors/${row.id}`} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-4 hover:bg-zinc-50 md:grid-cols-[auto_minmax(0,1.3fr)_minmax(0,1fr)_90px_90px]">
                <StatusDot status={row.status} />
                <div className="min-w-0">
                  <p className="truncate font-medium text-zinc-900">{row.name}</p>
                  <p className="flex items-center gap-1 truncate text-xs text-zinc-500">
                    <Globe className="size-3 shrink-0" />
                    {row.url.replace(/^https?:\/\//, '')}
                  </p>
                  {row.openIncident && <p className="mt-1 truncate text-xs font-medium text-red-600">{row.openIncident.cause}</p>}
                </div>
                <div className="hidden md:block">
                  <Sparkline points={row.spark} />
                </div>
                <div className="hidden text-right md:block">
                  <p className={cn('text-sm font-semibold tabular-nums', uptimeColor(row.uptime24h))}>{formatUptime(row.uptime24h)}</p>
                  <p className="text-[11px] text-zinc-400">uptime 24h</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-zinc-800 tabular-nums">
                    {row.status === 'PAUSED' ? statusLabel('PAUSED') : row.lastLatencyMs !== null ? `${row.lastLatencyMs} ms` : statusLabel(row.status)}
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    <Ago iso={row.lastCheckedAt} now={now} />
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
