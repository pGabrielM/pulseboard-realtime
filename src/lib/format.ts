import { format, formatDistanceStrict, formatDistanceToNowStrict } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const relative = (date: Date | string) => formatDistanceToNowStrict(new Date(date), { locale: ptBR, addSuffix: true })
export const duration = (from: Date | string | number, to: Date | string | number) => formatDistanceStrict(new Date(from), new Date(to), { locale: ptBR })
export const formatDate = (date: Date | string, pattern = "dd/MM 'às' HH:mm") => format(new Date(date), pattern, { locale: ptBR })

export function formatUptime(value: number | null): string {
  if (value === null) return '—'
  if (value === 100) return '100%'
  return `${value.toFixed(value >= 99 ? 2 : 1)}%`
}

export function uptimeColor(value: number | null): string {
  if (value === null) return 'text-zinc-400'
  if (value >= 99) return 'text-emerald-600'
  if (value >= 95) return 'text-amber-600'
  return 'text-red-600'
}
