import { Activity } from 'lucide-react'
import type { Metadata } from 'next'
import { LiveMonitors } from '@/components/monitors/live-monitors'
import { MonitorForm } from '@/components/monitors/monitor-form'
import { PageHeader } from '@/components/shell/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { getMonitorRows } from '@/lib/queries'
import { requireUser } from '@/lib/session'

export const metadata: Metadata = { title: 'Monitores' }

export default async function MonitorsPage() {
  const user = await requireUser()
  const rows = await getMonitorRows(user.id)

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Monitores" description="Disponibilidade e latência dos seus sites e APIs." actions={<MonitorForm />} />
      {rows.length === 0 ? (
        <EmptyState icon={Activity} title="Nenhum monitor" description="Adicione a URL de um site ou API para começar a acompanhar." action={<MonitorForm />} />
      ) : (
        <LiveMonitors initial={rows} />
      )}
    </div>
  )
}
