import { Activity, AlertTriangle, Globe } from 'lucide-react'

export const appNav = [
  { href: '/app', label: 'Monitores', icon: Activity, exact: true },
  { href: '/app/incidents', label: 'Incidentes', icon: AlertTriangle },
  { href: '/app/status-pages', label: 'Páginas de status', icon: Globe },
]
