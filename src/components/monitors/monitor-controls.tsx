'use client'

import { Pause, Play, RefreshCw } from 'lucide-react'
import { ConfirmButton } from '@/components/confirm-button'
import { Button } from '@/components/ui/button'
import { checkNow, deleteMonitor, setPaused } from '@/lib/actions'
import { useAction } from '@/lib/use-action'

export function MonitorControls({ monitorId, paused }: { monitorId: string; paused: boolean }) {
  const { pending, run } = useAction()
  return (
    <>
      {!paused && (
        <Button variant="secondary" disabled={pending} onClick={() => run(() => checkNow(monitorId), { success: 'Online e respondendo.' })}>
          <RefreshCw className={pending ? 'animate-spin' : undefined} /> Checar agora
        </Button>
      )}
      <Button variant="secondary" disabled={pending} onClick={() => run(() => setPaused(monitorId, !paused), { success: paused ? 'Monitor retomado.' : 'Monitor pausado.' })}>
        {paused ? <Play /> : <Pause />} {paused ? 'Retomar' : 'Pausar'}
      </Button>
      <ConfirmButton
        compact
        title="Excluir monitor?"
        description="O histórico de checagens e incidentes também será apagado."
        action={deleteMonitor.bind(null, monitorId)}
      />
    </>
  )
}
