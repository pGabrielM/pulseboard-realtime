export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2 font-mono">
      <svg viewBox="0 0 32 20" className="h-5 w-8 text-brand-500" fill="none" aria-hidden="true">
        <path d="M0 10h7l3-7 5 14 4-10 2 3h11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {!compact && (
        <span className="text-[15px] font-semibold tracking-tight text-zinc-900">
          pulse<span className="text-brand-500">/</span>board
        </span>
      )}
    </span>
  )
}
