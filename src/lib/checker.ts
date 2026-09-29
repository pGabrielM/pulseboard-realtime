import 'server-only'

import type { Monitor, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { assertPublicUrl } from '@/lib/net-guard'

const MAX_BODY = 512 * 1024

export type CheckResult = { ok: boolean; statusCode: number | null; latencyMs: number | null; error: string | null }

function describe(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') return 'Tempo limite excedido'
    const cause = (error as Error & { cause?: { code?: string; message?: string } }).cause
    if (cause?.code === 'ENOTFOUND') return 'Domínio não encontrado (DNS)'
    if (cause?.code === 'ECONNREFUSED') return 'Conexão recusada'
    if (cause?.code?.startsWith('CERT_') || cause?.code?.includes('SSL') || cause?.code === 'DEPTH_ZERO_SELF_SIGNED_CERT' || cause?.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE')
      return 'Certificado SSL inválido'
    return cause?.message ?? error.message
  }
  return 'Falha desconhecida'
}

async function readBody(response: Response): Promise<string> {
  if (!response.body) return ''
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let text = ''
  while (text.length < MAX_BODY) {
    const { done, value } = await reader.read()
    if (done) break
    text += decoder.decode(value, { stream: true })
  }
  await reader.cancel().catch(() => undefined)
  return text
}

export async function performCheck(monitor: Pick<Monitor, 'url' | 'method' | 'expectedStatus' | 'keyword' | 'timeoutMs'>): Promise<CheckResult> {
  const started = performance.now()
  try {
    const url = await assertPublicUrl(monitor.url)
    const response = await fetch(url, {
      method: monitor.method,
      redirect: 'follow',
      cache: 'no-store',
      headers: { 'User-Agent': 'PulseBoard-Monitor/1.0 (+https://github.com/pGabrielM/pulseboard-realtime)' },
      signal: AbortSignal.timeout(monitor.timeoutMs),
    })
    const latencyMs = Math.round(performance.now() - started)

    if (response.status !== monitor.expectedStatus) {
      await response.body?.cancel().catch(() => undefined)
      return { ok: false, statusCode: response.status, latencyMs, error: `Status ${response.status} (esperado ${monitor.expectedStatus})` }
    }
    if (monitor.keyword && monitor.method === 'GET') {
      const body = await readBody(response)
      if (!body.includes(monitor.keyword)) {
        return { ok: false, statusCode: response.status, latencyMs, error: `Palavra-chave "${monitor.keyword}" não encontrada` }
      }
    } else {
      await response.body?.cancel().catch(() => undefined)
    }
    return { ok: true, statusCode: response.status, latencyMs, error: null }
  } catch (error) {
    return { ok: false, statusCode: null, latencyMs: null, error: describe(error) }
  }
}

// Stores the result and moves the monitor through its state machine:
// a single failure is treated as a blip; two consecutive failures mark it DOWN and open an incident.
export async function recordCheck(monitor: Monitor, result: CheckResult, checkedAt = new Date()): Promise<void> {
  const previous = await prisma.check.findFirst({
    where: { monitorId: monitor.id },
    orderBy: { checkedAt: 'desc' },
    select: { ok: true },
  })

  const operations: Prisma.PrismaPromise<unknown>[] = [
    prisma.check.create({ data: { monitorId: monitor.id, checkedAt, ...result } }),
  ]

  let status = monitor.status
  if (result.ok) {
    status = 'UP'
    if (monitor.status === 'DOWN') {
      operations.push(
        prisma.incident.updateMany({ where: { monitorId: monitor.id, resolvedAt: null }, data: { resolvedAt: checkedAt } }),
      )
    }
  } else if (monitor.status === 'DOWN') {
    status = 'DOWN'
  } else if (previous && !previous.ok) {
    status = 'DOWN'
    operations.push(prisma.incident.create({ data: { monitorId: monitor.id, startedAt: checkedAt, cause: result.error ?? 'Falha' } }))
  } else if (monitor.status === 'PENDING') {
    status = 'PENDING'
  }

  operations.push(
    prisma.monitor.update({
      where: { id: monitor.id },
      data: { status, lastCheckedAt: checkedAt, lastLatencyMs: result.latencyMs },
    }),
  )
  await prisma.$transaction(operations)
}

export async function checkMonitor(monitor: Monitor): Promise<CheckResult> {
  const result = await performCheck(monitor)
  await recordCheck(monitor, result)
  return result
}

async function claim(monitor: Monitor): Promise<boolean> {
  // Optimistic lock: only one runner (cron, SSE stream or "check now") wins a given slot.
  const claimed = await prisma.monitor.updateMany({
    where: { id: monitor.id, lastCheckedAt: monitor.lastCheckedAt },
    data: { lastCheckedAt: new Date() },
  })
  return claimed.count === 1
}

export async function runDueChecks({ ownerId, limit = 25 }: { ownerId?: string; limit?: number } = {}) {
  const now = Date.now()
  const candidates = await prisma.monitor.findMany({
    where: { status: { not: 'PAUSED' }, ...(ownerId ? { ownerId } : {}) },
    orderBy: { lastCheckedAt: { sort: 'asc', nulls: 'first' } },
    take: 200,
  })
  const due = candidates
    .filter((monitor) => !monitor.lastCheckedAt || monitor.lastCheckedAt.getTime() + monitor.intervalSeconds * 1000 <= now)
    .slice(0, limit)

  let checked = 0
  const queue = [...due]
  const workers = Array.from({ length: 5 }, async () => {
    for (let monitor = queue.shift(); monitor; monitor = queue.shift()) {
      if (!(await claim(monitor))) continue
      const result = await performCheck(monitor)
      await recordCheck(monitor, result)
      checked++
    }
  })
  await Promise.all(workers)
  return { due: due.length, checked }
}
