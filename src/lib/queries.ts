import 'server-only'

import { subDays, subHours } from 'date-fns'
import { prisma } from '@/lib/prisma'

export type SparkPoint = { ok: boolean; latency: number | null }

export type MonitorRow = {
  id: string
  name: string
  url: string
  status: 'PENDING' | 'UP' | 'DOWN' | 'PAUSED'
  intervalSeconds: number
  lastCheckedAt: string | null
  lastLatencyMs: number | null
  uptime24h: number | null
  avgLatency24h: number | null
  spark: SparkPoint[]
  openIncident: { startedAt: string; cause: string } | null
}

function uptimeOf(checks: { ok: boolean }[]): number | null {
  if (checks.length === 0) return null
  return (checks.filter((check) => check.ok).length / checks.length) * 100
}

function avgLatency(checks: { ok: boolean; latencyMs: number | null }[]): number | null {
  const values = checks.filter((check) => check.ok && check.latencyMs !== null).map((check) => check.latencyMs!)
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null
}

export async function getMonitorRows(userId: string): Promise<MonitorRow[]> {
  const since = subHours(new Date(), 24)
  const [monitors, checks, incidents] = await Promise.all([
    prisma.monitor.findMany({ where: { ownerId: userId }, orderBy: [{ createdAt: 'asc' }] }),
    prisma.check.findMany({
      where: { monitor: { ownerId: userId }, checkedAt: { gte: since } },
      select: { monitorId: true, ok: true, latencyMs: true },
      orderBy: { checkedAt: 'asc' },
    }),
    prisma.incident.findMany({ where: { monitor: { ownerId: userId }, resolvedAt: null } }),
  ])

  return monitors.map((monitor) => {
    const own = checks.filter((check) => check.monitorId === monitor.id)
    const incident = incidents.find((item) => item.monitorId === monitor.id)
    return {
      id: monitor.id,
      name: monitor.name,
      url: monitor.url,
      status: monitor.status,
      intervalSeconds: monitor.intervalSeconds,
      lastCheckedAt: monitor.lastCheckedAt?.toISOString() ?? null,
      lastLatencyMs: monitor.lastLatencyMs,
      uptime24h: uptimeOf(own),
      avgLatency24h: avgLatency(own),
      spark: own.slice(-40).map((check) => ({ ok: check.ok, latency: check.latencyMs })),
      openIncident: incident ? { startedAt: incident.startedAt.toISOString(), cause: incident.cause } : null,
    }
  })
}

export async function getMonitorDetail(userId: string, monitorId: string) {
  const monitor = await prisma.monitor.findFirst({ where: { id: monitorId, ownerId: userId } })
  if (!monitor) return null
  const now = new Date()

  const windows = [
    { label: '24 horas', since: subHours(now, 24) },
    { label: '7 dias', since: subDays(now, 7) },
    { label: '30 dias', since: subDays(now, 30) },
  ]

  const [uptimes, recent24h, incidents, lastChecks] = await Promise.all([
    Promise.all(
      windows.map(async (window) => {
        const [total, ok] = await Promise.all([
          prisma.check.count({ where: { monitorId, checkedAt: { gte: window.since } } }),
          prisma.check.count({ where: { monitorId, checkedAt: { gte: window.since }, ok: true } }),
        ])
        return { label: window.label, uptime: total ? (ok / total) * 100 : null }
      }),
    ),
    prisma.check.findMany({
      where: { monitorId, checkedAt: { gte: subHours(now, 24) } },
      select: { checkedAt: true, ok: true, latencyMs: true },
      orderBy: { checkedAt: 'asc' },
    }),
    prisma.incident.findMany({ where: { monitorId }, orderBy: { startedAt: 'desc' }, take: 20 }),
    prisma.check.findMany({ where: { monitorId }, orderBy: { checkedAt: 'desc' }, take: 15 }),
  ])

  return { monitor, uptimes, recent24h, incidents, lastChecks, avgLatency: avgLatency(recent24h) }
}

export async function getIncidents(userId: string) {
  return prisma.incident.findMany({
    where: { monitor: { ownerId: userId } },
    include: { monitor: { select: { id: true, name: true, url: true } } },
    orderBy: { startedAt: 'desc' },
    take: 100,
  })
}

export async function getStatusPages(userId: string) {
  return prisma.statusPage.findMany({
    where: { ownerId: userId },
    include: { monitors: { select: { id: true, name: true, status: true } } },
    orderBy: { createdAt: 'asc' },
  })
}

type DailyRow = { monitor_id: string; day: string; total: bigint; ok: bigint }

const TIMEZONE = process.env.APP_TIMEZONE ?? 'America/Sao_Paulo'
const dayKey = (date: Date) => date.toLocaleDateString('en-CA', { timeZone: TIMEZONE })

export async function getPublicStatus(slug: string) {
  const page = await prisma.statusPage.findUnique({
    where: { slug },
    include: { monitors: { orderBy: { createdAt: 'asc' } } },
  })
  if (!page) return null

  const ids = page.monitors.map((monitor) => monitor.id)
  const since = subDays(new Date(), 91)
  // Days are bucketed in the business timezone (checked_at is stored in UTC).
  const rows = ids.length
    ? await prisma.$queryRaw<DailyRow[]>`
        SELECT monitor_id,
               to_char(checked_at AT TIME ZONE 'UTC' AT TIME ZONE ${TIMEZONE}, 'YYYY-MM-DD') AS day,
               count(*) AS total,
               count(*) FILTER (WHERE ok) AS ok
        FROM checks
        WHERE monitor_id = ANY(${ids}) AND checked_at >= ${since}
        GROUP BY monitor_id, day`
    : []
  const incidents = await prisma.incident.findMany({
    where: { monitorId: { in: ids }, startedAt: { gte: subDays(new Date(), 30) } },
    include: { monitor: { select: { name: true } } },
    orderBy: { startedAt: 'desc' },
  })

  const days = Array.from({ length: 90 }, (_, index) => subDays(new Date(), 89 - index))
  const monitors = page.monitors.map((monitor) => {
    const own = rows.filter((row) => row.monitor_id === monitor.id)
    const daily = days.map((day) => {
      const row = own.find((item) => item.day === dayKey(day))
      return { day, uptime: row ? (Number(row.ok) / Number(row.total)) * 100 : null }
    })
    const total = own.reduce((sum, row) => sum + Number(row.total), 0)
    const ok = own.reduce((sum, row) => sum + Number(row.ok), 0)
    return { id: monitor.id, name: monitor.name, status: monitor.status, daily, uptime90: total ? (ok / total) * 100 : null }
  })

  return { page, monitors, incidents }
}
