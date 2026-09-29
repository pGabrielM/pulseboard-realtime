import { cn } from '@/lib/utils'

const styles = {
  UP: { dot: 'bg-emerald-500', ring: 'bg-emerald-400', label: 'Online' },
  DOWN: { dot: 'bg-red-500', ring: 'bg-red-400', label: 'Fora do ar' },
  PENDING: { dot: 'bg-zinc-400', ring: 'bg-zinc-300', label: 'Verificando' },
  PAUSED: { dot: 'bg-zinc-300', ring: 'bg-zinc-200', label: 'Pausado' },
} as const

export function statusLabel(status: keyof typeof styles) {
  return styles[status].label
}

export function StatusDot({ status, size = 'md' }: { status: keyof typeof styles; size?: 'sm' | 'md' }) {
  const style = styles[status]
  const dimension = size === 'sm' ? 'size-2' : 'size-2.5'
  return (
    <span className={cn('relative flex shrink-0', dimension)} aria-label={style.label} title={style.label}>
      {(status === 'UP' || status === 'DOWN') && (
        <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-60', style.ring)} />
      )}
      <span className={cn('relative inline-flex rounded-full', dimension, style.dot)} />
    </span>
  )
}
