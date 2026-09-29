import { cn } from '@/lib/utils'

export function ProgressBar({ percent, className, barClassName }: { percent: number; className?: string; barClassName?: string }) {
  return (
    <div className={cn('h-1.5 overflow-hidden rounded-full bg-zinc-100', className)}>
      <div className={cn('h-full rounded-full bg-brand-500 transition-all', barClassName)} style={{ width: `${percent}%` }} />
    </div>
  )
}
