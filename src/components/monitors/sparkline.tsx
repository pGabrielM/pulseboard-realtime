import type { SparkPoint } from '@/lib/queries'

// Latency bars; failed checks are drawn full-height in red so outages stand out at a glance.
export function Sparkline({ points, slots = 40 }: { points: SparkPoint[]; slots?: number }) {
  const padded: (SparkPoint | null)[] = [...Array(Math.max(0, slots - points.length)).fill(null), ...points.slice(-slots)]
  const max = Math.max(100, ...points.map((point) => point.latency ?? 0))
  return (
    <div className="flex h-8 items-end gap-[2px]" aria-hidden="true">
      {padded.map((point, index) => (
        <span
          key={index}
          className={point === null ? 'w-[3px] rounded-sm bg-zinc-100' : point.ok ? 'w-[3px] rounded-sm bg-emerald-400' : 'w-[3px] rounded-sm bg-red-500'}
          style={{
            height:
              point === null ? '20%' : point.ok ? `${Math.max(12, ((point.latency ?? 0) / max) * 100)}%` : '100%',
          }}
        />
      ))}
    </div>
  )
}
