'use client'

import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import type { ActionResult } from '@/lib/actions'
import { useAction } from '@/lib/use-action'

export function ConfirmButton({
  title,
  description,
  action,
  label = 'Excluir',
  success,
  compact = false,
}: {
  title: string
  description: string
  action: () => Promise<ActionResult | void>
  label?: string
  success?: string
  compact?: boolean
}) {
  const [open, setOpen] = useState(false)
  const { pending, run } = useAction()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {compact ? (
          <Button variant="ghost" size="icon" aria-label={label} className="text-zinc-400 hover:text-red-600">
            <Trash2 />
          </Button>
        ) : (
          <Button variant="secondary" className="text-red-600">
            <Trash2 /> {label}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent title={title} description={description}>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            disabled={pending}
            onClick={() => run(action, { success, onSuccess: () => setOpen(false) })}
          >
            {pending ? 'Excluindo…' : label}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
