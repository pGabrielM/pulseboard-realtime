import { Activity } from 'lucide-react'

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className="flex size-7 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
        <Activity className="size-4" />
      </span>
      {!compact && <span className="text-[15px] font-semibold tracking-tight">PulseBoard</span>}
    </span>
  )
}
