import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
  {
    variants: {
      tone: {
        neutral: 'bg-zinc-50 text-zinc-700 ring-zinc-200',
        brand: 'bg-brand-50 text-brand-700 ring-brand-200',
        green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
        amber: 'bg-amber-50 text-amber-700 ring-amber-200',
        red: 'bg-red-50 text-red-700 ring-red-200',
        blue: 'bg-sky-50 text-sky-700 ring-sky-200',
        violet: 'bg-violet-50 text-violet-700 ring-violet-200',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

export function Badge({
  className,
  tone,
  ...props
}: ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />
}
