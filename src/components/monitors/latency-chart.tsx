import { formatDate } from '@/lib/format'

type Point = { checkedAt: Date; ok: boolean; latencyMs: number | null }

export function LatencyChart({ points }: { points: Point[] }) {
  if (points.length < 2) {
    return <p className="py-16 text-center text-sm text-zinc-400">Dados insuficientes nas últimas 24 horas.</p>
  }
  const width = 800
  const height = 200
  const pad = { top: 10, right: 24, bottom: 24, left: 64 }
  const start = points[0]!.checkedAt.getTime()
  const end = points.at(-1)!.checkedAt.getTime()
  const max = Math.max(100, ...points.map((point) => point.latencyMs ?? 0)) * 1.1
  const x = (date: Date) => pad.left + ((date.getTime() - start) / Math.max(1, end - start)) * (width - pad.left - pad.right)
  const y = (value: number) => pad.top + (1 - value / max) * (height - pad.top - pad.bottom)

  const okPoints = points.filter((point) => point.ok && point.latencyMs !== null)
  const line = okPoints.map((point, index) => `${index ? 'L' : 'M'}${x(point.checkedAt).toFixed(1)},${y(point.latencyMs!).toFixed(1)}`).join(' ')
  const area = okPoints.length
    ? `${line} L${x(okPoints.at(-1)!.checkedAt).toFixed(1)},${height - pad.bottom} L${x(okPoints[0]!.checkedAt).toFixed(1)},${height - pad.bottom} Z`
    : ''
  const ticks = [0, 0.5, 1].map((fraction) => Math.round(max * fraction))
  const timeTicks = [0, 0.25, 0.5, 0.75, 1].map((fraction) => new Date(start + (end - start) * fraction))

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Latência nas últimas 24 horas">
      <defs>
        <linearGradient id="latency-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--color-emerald-500)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--color-emerald-500)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={pad.left} x2={width - pad.right} y1={y(tick)} y2={y(tick)} stroke="var(--color-zinc-100)" />
          <text x={pad.left - 8} y={y(tick) + 4} textAnchor="end" className="fill-zinc-400 text-[11px]">
            {tick} ms
          </text>
        </g>
      ))}
      {timeTicks.map((tick, index) => (
        <text
          key={tick.getTime()}
          x={x(tick)}
          y={height - 6}
          textAnchor={index === 0 ? 'start' : index === timeTicks.length - 1 ? 'end' : 'middle'}
          className="fill-zinc-400 text-[11px]"
        >
          {formatDate(tick, 'HH:mm')}
        </text>
      ))}
      {points
        .filter((point) => !point.ok)
        .map((point) => (
          <rect key={point.checkedAt.getTime()} x={x(point.checkedAt) - 1.5} y={pad.top} width={3} height={height - pad.top - pad.bottom} className="fill-red-400/50" />
        ))}
      {area && <path d={area} fill="url(#latency-fill)" />}
      {line && <path d={line} fill="none" stroke="var(--color-emerald-500)" strokeWidth={1.75} strokeLinejoin="round" />}
    </svg>
  )
}
